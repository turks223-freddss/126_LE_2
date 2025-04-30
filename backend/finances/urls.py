from django.urls import path
from .views import AddIncomeView, AddExpenseView, BudgetCalculatorView, finance_details, list_user_income, list_user_expense, modify_income,modify_expense, delete_finance_entry
from . import views

urlpatterns = [
    path('add-income/', AddIncomeView.as_view(), name='add-income'),
    path('add-expense/', AddExpenseView.as_view(), name='add-expense'),
    path('budget/', BudgetCalculatorView.as_view(), name='budget'),
    path('<int:user_id>/finance-details/', finance_details, name='finance_details'),
    path('delete/<int:user_id>/<int:entry_id>/', delete_finance_entry, name='delete_finance_entry'),
    
    
    # not used
    path('list-income/', list_user_income, name='list_user_income'),
    path('list-expense/', list_user_expense, name='list_user_expense'),
    path('income/<int:income_id>/', modify_income, name='modify_income'),
    path('expense/<int:expense_id>/', modify_expense, name='modify_expense'),
    
    
    path('<int:user_id>/reports/', views.get_reports, name='get_reports'),
]