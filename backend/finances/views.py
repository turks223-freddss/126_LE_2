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
from django.shortcuts import render
from django.http import JsonResponse
from django.core.serializers import serialize

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
        
def finance_details(request, user_id):
    incomes = Income.objects.filter(user_id=user_id)
    expenses = Expense.objects.filter(user_id=user_id)

    combined_data = []

    for income in incomes:
        combined_data.append({
            'type': 'income',
            'category': income.category,
            'amount': float(income.income),
            'date': income.date.isoformat(),  # send date as string
        })

    for expense in expenses:
        combined_data.append({
            'type': 'expense',
            'category': expense.category,
            'amount': float(expense.expense) * -1,  # Expenses are negative
            'date': expense.date.isoformat(),
        })

    # Sort by date ascending
    combined_data.sort(key=lambda x: x['date'])

    return JsonResponse({'finance': combined_data})

class ReportsView(APIView):
    def get(self, request, user_id):
        try:
            user = get_object_or_404(User, id=user_id)
            
            # Get all expenses grouped by category
            expenses_by_category = Expense.objects.filter(user=user).values('category').annotate(
                total=Sum('expense')
            ).order_by('-total')
            
            # Get monthly income and expenses
            monthly_data = []
            incomes = Income.objects.filter(user=user).values('date__year', 'date__month').annotate(
                total=Sum('income')
            )
            expenses = Expense.objects.filter(user=user).values('date__year', 'date__month').annotate(
                total=Sum('expense')
            )
            
            # Combine and format monthly data
            for income in incomes:
                year = income['date__year']
                month = income['date__month']
                month_key = f"{year}-{month:02d}"
                
                monthly_data.append({
                    'month': month_key,
                    'income': float(income['total']),
                    'expenses': 0
                })
            
            for expense in expenses:
                year = expense['date__year']
                month = expense['date__month']
                month_key = f"{year}-{month:02d}"
                
                # Find or create entry for this month
                month_entry = next((item for item in monthly_data if item['month'] == month_key), None)
                if month_entry:
                    month_entry['expenses'] = float(expense['total'])
                else:
                    monthly_data.append({
                        'month': month_key,
                        'income': 0,
                        'expenses': float(expense['total'])
                    })
            
            # Sort monthly data by month
            monthly_data.sort(key=lambda x: x['month'])
            
            return Response({
                'expenses_by_category': list(expenses_by_category),
                'monthly_data': monthly_data
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)