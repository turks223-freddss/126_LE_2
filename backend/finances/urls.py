from django.urls import path
from .views import AddIncomeView, AddExpenseView, BudgetCalculatorView, SetMonthlyBudgetView, finance_details, delete_finance_entry, update_finance_entry, budget_details
from . import views

urlpatterns = [
    path('add-income/', AddIncomeView.as_view(), name='add-income'),
    path('add-expense/', AddExpenseView.as_view(), name='add-expense'),
    path('budget/', BudgetCalculatorView.as_view(), name='budget'),
    path('<int:user_id>/finance-details/', finance_details, name='finance_details'),
    path('<int:user_id>/budget/', budget_details, name='budget_details'),
    path('<int:user_id>/budget/delete/<int:entry_id>/', views.delete_budget_entry, name='delete_budget_entry'),
    path('delete/<int:user_id>/<int:entry_id>/', delete_finance_entry, name='delete_finance_entry'),
    path('update/<int:user_id>/<int:entry_id>/', update_finance_entry, name='update_finance_entry'),
    path('<int:user_id>/reports/', views.get_reports, name='get_reports'),
    path('set-monthly-budget/', SetMonthlyBudgetView.as_view(), name='set-monthly-budget'),
]