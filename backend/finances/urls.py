from django.urls import path
from . import views

urlpatterns = [
    path('add-income/', views.AddIncomeView.as_view(), name='add-income'),
    path('add-expense/', views.AddExpenseView.as_view(), name='add-expense'),
    path('budget/', views.BudgetCalculatorView.as_view(), name='budget'),
    path('<int:user_id>/finance-details/', views.finance_details, name='finance-details'),
    path('<int:user_id>/reports/', views.ReportsView.as_view(), name='reports'),
]