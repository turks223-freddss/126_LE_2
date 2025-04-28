from django.urls import path
from .views import AddIncomeView, AddExpenseView, BudgetCalculatorView, finance_details

urlpatterns = [
    path('add-income/', AddIncomeView.as_view(), name='add-income'),
    path('add-expense/', AddExpenseView.as_view(), name='add-expense'),
    path('budget/', BudgetCalculatorView.as_view(), name='budget'),
    path('<int:user_id>/finance-details/', finance_details, name='finance_details'),
]