import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { expenseService, Expense, ExpenseSummary, BudgetAlert, getCategoryIcon, getCategoryColor, formatCurrency } from '../services/expenseService';
import { useLocalization } from '../contexts/LocalizationContext';

interface ExpenseTrackerProps {
  tripId: string;
  visible: boolean;
  onClose: () => void;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ tripId, visible, onClose }) => {
  const { t } = useLocalization();
  
  const EXPENSE_CATEGORIES = [
    { id: 'food', label: t('expense.categories.food'), icon: '🍽️' },
    { id: 'transport', label: t('expense.categories.transport'), icon: '🚗' },
    { id: 'accommodation', label: t('expense.categories.accommodation'), icon: '🏨' },
    { id: 'entertainment', label: t('expense.categories.entertainment'), icon: '🎭' },
    { id: 'shopping', label: t('expense.categories.shopping'), icon: '🛍️' },
    { id: 'other', label: t('expense.categories.other'), icon: '💳' },
  ];
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [processingReceipt, setProcessingReceipt] = useState(false);

  // Add expense form state
  const [newExpense, setNewExpense] = useState({
    amount: '',
    description: '',
    category: 'food' as const,
    location: '',
    tags: [] as string[],
  });

  useEffect(() => {
    if (visible) {
      loadExpenseData();
    }
  }, [visible, tripId]);

  const loadExpenseData = async () => {
    try {
      setLoading(true);
      const [expensesData, summaryData, alertsData] = await Promise.all([
        expenseService.getExpensesForTrip(tripId),
        expenseService.getExpenseSummary(tripId),
        expenseService.generateBudgetAlerts(tripId),
      ]);
      
      setExpenses(expensesData);
      setSummary(summaryData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading expense data:', error);
      Alert.alert(t('common.error'), t('alert.loadExpenseError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCaptureReceipt = async () => {
    try {
      setProcessingReceipt(true);
      const receiptUri = await expenseService.captureReceipt();
      
      if (receiptUri) {
        const { amount, description } = await expenseService.processReceipt(receiptUri);
        
        setNewExpense(prev => ({
          ...prev,
          amount: amount ? amount.toString() : '',
          description: description,
        }));
        
        Alert.alert(t('alert.receiptProcessed'), amount ? t('alert.amountDetected').replace('{amount}', formatCurrency(amount)) : t('alert.amountNotDetected'));
      }
    } catch (error) {
      console.error('Error processing receipt:', error);
      Alert.alert(t('common.error'), t('alert.processReceiptError'));
    } finally {
      setProcessingReceipt(false);
    }
  };

  const handleSelectReceipt = async () => {
    try {
      setProcessingReceipt(true);
      const receiptUri = await expenseService.selectReceiptFromGallery();
      
      if (receiptUri) {
        const { amount, description } = await expenseService.processReceipt(receiptUri);
        
        setNewExpense(prev => ({
          ...prev,
          amount: amount ? amount.toString() : '',
          description: description,
        }));
        
        Alert.alert(t('alert.receiptProcessed'), amount ? t('alert.amountDetected').replace('{amount}', formatCurrency(amount)) : t('alert.amountNotDetected'));
      }
    } catch (error) {
      console.error('Error processing receipt:', error);
      Alert.alert(t('common.error'), t('alert.processReceiptError'));
    } finally {
      setProcessingReceipt(false);
    }
  };

  const handleSaveExpense = async () => {
    if (!newExpense.amount || !newExpense.description) {
      Alert.alert(t('common.error'), t('alert.fillAmountDescription'));
      return;
    }

    try {
      const amount = parseFloat(newExpense.amount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert(t('common.error'), t('alert.enterValidAmount'));
        return;
      }

      await expenseService.saveExpense({
        tripId,
        amount,
        description: newExpense.description,
        category: newExpense.category,
        date: new Date().toISOString().split('T')[0],
        location: newExpense.location,
        tags: newExpense.tags,
      });

      setNewExpense({
        amount: '',
        description: '',
        category: 'food',
        location: '',
        tags: [],
      });
      setShowAddExpense(false);
      await loadExpenseData();
      
      Alert.alert(t('common.success'), t('alert.expenseAdded'));
    } catch (error) {
      console.error('Error saving expense:', error);
      Alert.alert(t('common.error'), t('alert.saveExpenseError'));
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    Alert.alert(
      t('alert.deleteExpense'),
      t('alert.deleteExpenseConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await expenseService.deleteExpense(expenseId);
              await loadExpenseData();
            } catch (error) {
              console.error('Error deleting expense:', error);
              Alert.alert(t('common.error'), t('alert.deleteExpenseError'));
            }
          },
        },
      ]
    );
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'danger': return '🚨';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return '#F59E0B';
      case 'danger': return '#EF4444';
      case 'info': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Expense Tracker</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4285F4" />
            <Text style={styles.loadingText}>Loading expenses...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Expense Tracker</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Budget Alerts */}
          {alerts.length > 0 && (
            <View style={styles.alertsContainer}>
              <Text style={styles.sectionTitle}>Budget Alerts</Text>
              {alerts.map((alert, index) => (
                <View key={index} style={[styles.alert, { borderLeftColor: getAlertColor(alert.type) }]}>
                  <Text style={styles.alertIcon}>{getAlertIcon(alert.type)}</Text>
                  <View style={styles.alertContent}>
                    <Text style={styles.alertMessage}>{alert.message}</Text>
                    {alert.amount && alert.threshold && (
                      <Text style={styles.alertDetails}>
                        {formatCurrency(alert.amount)} / {formatCurrency(alert.threshold)}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Summary */}
          {summary && (
            <View style={styles.summaryContainer}>
              <Text style={styles.sectionTitle}>Spending Summary</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Spent</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(summary.totalSpent)}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Daily Average</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(summary.dailyAverage)}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Over Budget Days</Text>
                  <Text style={[styles.summaryValue, summary.overBudgetDays > 0 && styles.overBudgetText]}>
                    {summary.overBudgetDays}
                  </Text>
                </View>
              </View>

              {/* Category Breakdown */}
              {summary.topCategories.length > 0 && (
                <View style={styles.categoriesContainer}>
                  <Text style={styles.categoriesTitle}>Top Categories</Text>
                  {summary.topCategories.map((category, index) => (
                    <View key={index} style={styles.categoryItem}>
                      <View style={styles.categoryInfo}>
                        <Text style={styles.categoryIcon}>{getCategoryIcon(category.category)}</Text>
                        <Text style={styles.categoryName}>{category.category}</Text>
                      </View>
                      <View style={styles.categoryAmount}>
                        <Text style={styles.categoryValue}>{formatCurrency(category.amount)}</Text>
                        <Text style={styles.categoryPercentage}>{Math.round(category.percentage)}%</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Add Expense Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddExpense(true)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Expense</Text>
          </TouchableOpacity>

          {/* Expenses List */}
          <View style={styles.expensesContainer}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            {expenses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>💳</Text>
                <Text style={styles.emptyText}>No expenses yet</Text>
                <Text style={styles.emptySubtext}>Add your first expense to start tracking</Text>
              </View>
            ) : (
              expenses.map((expense) => (
                <View key={expense.id} style={styles.expenseItem}>
                  <View style={styles.expenseInfo}>
                    <View style={styles.expenseHeader}>
                      <Text style={styles.expenseDescription}>{expense.description}</Text>
                      <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
                    </View>
                    <View style={styles.expenseDetails}>
                      <Text style={styles.expenseCategory}>
                        {getCategoryIcon(expense.category)} {expense.category}
                      </Text>
                      <Text style={styles.expenseDate}>
                        {new Date(expense.date).toLocaleDateString('en-GB')}
                      </Text>
                    </View>
                    {expense.location && (
                      <Text style={styles.expenseLocation}>📍 {expense.location}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteExpense(expense.id)}
                  >
                    <Ionicons name="trash" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Add Expense Modal */}
        <Modal visible={showAddExpense} animationType="slide" presentationStyle="pageSheet">
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setShowAddExpense(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Add Expense</Text>
              <TouchableOpacity onPress={handleSaveExpense}>
                <Text style={styles.saveButton}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.addExpenseContent}>
              {/* Receipt Capture */}
              <View style={styles.receiptSection}>
                <Text style={styles.inputLabel}>Receipt (Optional)</Text>
                <View style={styles.receiptButtons}>
                  <TouchableOpacity
                    style={styles.receiptButton}
                    onPress={handleCaptureReceipt}
                    disabled={processingReceipt}
                  >
                    {processingReceipt ? (
                      <ActivityIndicator size="small" color="#4285F4" />
                    ) : (
                      <Ionicons name="camera" size={20} color="#4285F4" />
                    )}
                    <Text style={styles.receiptButtonText}>Take Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.receiptButton}
                    onPress={handleSelectReceipt}
                    disabled={processingReceipt}
                  >
                    <Ionicons name="image" size={20} color="#4285F4" />
                    <Text style={styles.receiptButtonText}>From Gallery</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Amount */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount *</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('trip.amountPlaceholder')}
                  value={newExpense.amount}
                  onChangeText={(text) => setNewExpense(prev => ({ ...prev, amount: text }))}
                  keyboardType="numeric"
                />
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="What did you spend on?"
                  value={newExpense.description}
                  onChangeText={(text) => setNewExpense(prev => ({ ...prev, description: text }))}
                />
              </View>

              {/* Category */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.categoryGrid}>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryButton,
                        newExpense.category === category.id && styles.selectedCategoryButton
                      ]}
                      onPress={() => setNewExpense(prev => ({ ...prev, category: category.id as any }))}
                    >
                      <Text style={styles.categoryButtonIcon}>{category.icon}</Text>
                      <Text style={[
                        styles.categoryButtonText,
                        newExpense.category === category.id && styles.selectedCategoryButtonText
                      ]}>
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Location */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Where did you spend this?"
                  value={newExpense.location}
                  onChangeText={(text) => setNewExpense(prev => ({ ...prev, location: text }))}
                />
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveButton: {
    fontSize: 16,
    color: '#4285F4',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  alertsContainer: {
    marginBottom: 20,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 2,
  },
  alertDetails: {
    fontSize: 12,
    color: '#A16207',
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  overBudgetText: {
    color: '#EF4444',
  },
  categoriesContainer: {
    marginTop: 16,
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#374151',
    textTransform: 'capitalize',
  },
  categoryAmount: {
    alignItems: 'flex-end',
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#6B7280',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  expensesContainer: {
    marginBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  expenseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseCategory: {
    fontSize: 12,
    color: '#6B7280',
  },
  expenseDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  expenseLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  addExpenseContent: {
    flex: 1,
    padding: 16,
  },
  receiptSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  receiptButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  receiptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F7FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4285F4',
  },
  receiptButtonText: {
    color: '#4285F4',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  selectedCategoryButton: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  categoryButtonIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: '#FFFFFF',
  },
});
