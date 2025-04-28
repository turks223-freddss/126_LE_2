from django.urls import path
from .views import AddIncomeView, AddExpenseView

urlpatterns = [
    path('add-income/', AddIncomeView.as_view(), name='add-income'),
    path('add-expense/', AddExpenseView.as_view(), name='add-expense'),
]