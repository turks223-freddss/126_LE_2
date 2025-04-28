
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import Income
from .models import Expense
from django.shortcuts import get_object_or_404
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Sum

User = get_user_model()

class AddIncomeView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        income_amount = request.data.get('income')
        date = request.data.get('date')

        if not all([user_id, income_amount, date]):
            return Response({'error': 'user_id, income, and date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)

        try:
            income = Income.objects.create(
                user=user,
                income=income_amount,
                date=date
            )
            return Response({'message': 'Income added successfully', 'income_id': income.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AddExpenseView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        expense_amount = request.data.get('expense')
        category = request.data.get('category', 'expenses')  # default to 'expenses' if not provided
        date = request.data.get('date')

        if not all([user_id, expense_amount, date]):
            return Response({'error': 'user_id, expense, and date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)

        try:
            expense = Expense.objects.create(
                user=user,
                expense=expense_amount,
                category=category,
                date=date
            )
            return Response({'message': 'Expense added successfully', 'expense_id': expense.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class BudgetCalculatorView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')

        if not user_id:
            return Response({'error': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not start_date or not end_date:
            return Response({'error': 'start_date and end_date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)

        # Sum all incomes within date range
        total_income = Income.objects.filter(
            user=user,
            date__range=[start_date, end_date]
        ).aggregate(total=Sum('income'))['total'] or 0

        # Sum all expenses within date range
        total_expense = Expense.objects.filter(
            user=user,
            date__range=[start_date, end_date]
        ).aggregate(total=Sum('expense'))['total'] or 0

        # Calculate budget
        budget = total_income - total_expense

        return Response({
            'total_income': float(total_income),
            'total_expense': float(total_expense),
            'budget': float(budget)
        }, status=status.HTTP_200_OK)
        