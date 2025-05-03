from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import Income
from .models import Expense
from .models import MonthlyBudget
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import get_object_or_404
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.shortcuts import render
from django.http import JsonResponse
from django.core.serializers import serialize
from rest_framework.decorators import api_view
from django.db.models.functions import TruncMonth
from datetime import datetime, timedelta
from django.db import DatabaseError
from django.utils import timezone


User = get_user_model()
class SetMonthlyBudgetView(APIView):
    def post(self, request):
        user = request.user  # Get the authenticated user
        title = request.data.get('title')
        amount = request.data.get('amount')
        month = request.data.get('month')  # Month (1 to 12)
        year = request.data.get('year')  # Year (e.g., 2025)
        description = request.data.get('description')  # Description of the budget (optional)

        missing_fields = []
        
        if not title:
            missing_fields.append('Title')
        if not amount:
            missing_fields.append('Amount')
        if not month:
            missing_fields.append('Month')
        if not year:
            missing_fields.append('Year')

        if missing_fields:
            return Response({'error': f'Missing required fields: {", ".join(missing_fields)}'}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure that the budget for the user is set for the given month and year
        try:
            # If description is None, it will be omitted from the update_or_create
            budget, created = MonthlyBudget.objects.update_or_create(
                user=user,
                title=title,
                month=month,
                year=year,
                defaults={'amount': amount, 'description': description}  # Include description only if provided
            )
        except DatabaseError as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if created:
            return Response({'message': 'Monthly budget set successfully'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Monthly budget updated successfully'}, status=status.HTTP_200_OK)

class AddIncomeView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        amount = request.data.get('amount')
        date = request.data.get('date')
        title = request.data.get('title', 'Untitled')  # default to 'Untitled' if not provided
        description = request.data.get('description')  # can be None

        if not all([user_id, amount, date]):
            return Response({'error': 'user_id, income, and date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)

        try:
            income = Income.objects.create(
                user=user,
                income=amount,
                date=date,
                title=title,
                description=description
            )
            return Response({'message': 'Income added successfully', 'income_id': income.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AddExpenseView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        amount = request.data.get('amount')
        category = request.data.get('category', 'expenses')  # default to 'expenses' if not provided
        date = request.data.get('date')
        title = request.data.get('title', 'Untitled')  # default to 'Untitled' if not provided
        description = request.data.get('description')  # can be None

        if not all([user_id, amount, date]):
            return Response({'error': 'user_id, expense, and date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)

        try:
            expense = Expense.objects.create(
                user=user,
                expense=amount,
                category=category,
                date=date,
                title=title,
                description=description
            )
            return Response({'message': 'Expense added successfully', 'expense_id': expense.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class MonthlyBudgetCalculatorView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        month = request.data.get('month')  # Expecting a number 1-12
        year = request.data.get('year')

        if not user_id:
            return Response({'error': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not month or not year:
            return Response({'error': 'month and year are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure the month is valid (1-12)
        if not (1 <= month <= 12):
            return Response({'error': 'Invalid month. It should be between 1 and 12.'}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)

        # Sum all monthly budget entries for the given month and year
        total_budget = MonthlyBudget.objects.filter(
            user=user,
            month=month,
            year=year
        ).aggregate(total=Sum('amount'))['total'] or 0

        # Return the total budget for the specified month and year
        return Response({
            'total_budget': float(total_budget),
        }, status=status.HTTP_200_OK)

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
    # Get query parameters
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    category = request.GET.get('category')  # New category filter
    filter_type = request.GET.get('type', '')  # Filter by income or expense

    filter_type = filter_type.lower()

    # Fetch incomes and expenses for the given user
    incomes = Income.objects.filter(user_id=user_id)
    expenses = Expense.objects.filter(user_id=user_id)

    # Apply date range filter if provided
    if start_date and end_date:
        incomes = incomes.filter(date__range=[start_date, end_date])
        expenses = expenses.filter(date__range=[start_date, end_date])

    # Apply category filter if provided
    if category and category != 'all':  # 'all' means no category filter
        incomes = incomes.filter(category=category)
        expenses = expenses.filter(category=category)

    # Combine incomes and expenses
    combined_data = []

    # Add income data if filter is income or if no filter is set
    if filter_type in ['', 'income']:
        for income in incomes:
            combined_data.append({
                'id': income.id,
                'type': 'income',
                'category': income.category,
                'amount': float(income.income),
                'title': income.title,
                'description': income.description,
                'date': income.date.isoformat(),
            })

    # Add expense data if filter is expense or if no filter is set
    if filter_type in ['', 'expense']:
        for expense in expenses:
            combined_data.append({
                'id': expense.id,
                'type': 'expense',
                'category': expense.category,
                'amount': float(expense.expense) * -1,
                'title': expense.title,
                'description': expense.description,
                'date': expense.date.isoformat(),
            })

    # Sort by date ascending
    combined_data.sort(key=lambda x: x['date'])

    return JsonResponse({'finance': combined_data})

def budget_details(request, user_id):
    try:
        budgets = MonthlyBudget.objects.filter(user_id=user_id)
        
        if not budgets:
            return JsonResponse({'error': 'No budget data found for this user.'}, status=404)

        # Serialize the data
        serialized_data = [{
            'id': budget.id,
            'month': budget.month,
            'title': budget.title,
            'year': budget.year,
            'amount': str(budget.amount),  # Convert Decimal to string
            'description': budget.description,
        } for budget in budgets]

        return JsonResponse({'budget': serialized_data}, status=200)
    
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'No budget data found for this user.'}, status=404)
    except Exception as e:
        print(f"Error fetching budget data: {e}")
        return JsonResponse({'error': 'Internal server error.'}, status=500)



@api_view(['PATCH'])
def update_finance_entry(request, user_id, entry_id):
    entry_type = request.data.get('type')
    new_title = request.data.get('title')
    new_description = request.data.get('description')
    new_category = request.data.get('category')
    new_amount = request.data.get('amount')

    if not entry_type:
        return JsonResponse({'error': 'Type (income or expense) is required.'}, status=status.HTTP_400_BAD_REQUEST)

    if not any([new_title, new_description, new_category, new_amount]):
        return JsonResponse({'error': 'At least one field (title, description, category, amount) is required for update.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        if entry_type == 'income':
            entry = Income.objects.get(id=entry_id, user_id=user_id)
            if new_title:
                entry.title = new_title
            if new_description:
                entry.description = new_description
            if new_category:
                entry.category = new_category
            if new_amount is not None:
                entry.income = new_amount
            entry.save()
        elif entry_type == 'expense':
            entry = Expense.objects.get(id=entry_id, user_id=user_id)
            if new_title:
                entry.title = new_title
            if new_description:
                entry.description = new_description
            if new_category:
                entry.category = new_category
            if new_amount is not None:
                entry.expense = new_amount
            entry.save()
        else:
            return JsonResponse({'error': 'Invalid type. Must be "income" or "expense".'}, status=status.HTTP_400_BAD_REQUEST)

        return JsonResponse({'message': f'{entry_type.capitalize()} entry updated successfully.'}, status=status.HTTP_200_OK)

    except (Income.DoesNotExist, Expense.DoesNotExist):
        return JsonResponse({'error': f'{entry_type.capitalize()} entry not found.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
def delete_budget_entry(request, user_id, entry_id):
    try:
        # Find the budget entry for the given user_id and entry_id
        budget_entry = MonthlyBudget.objects.get(id=entry_id, user_id=user_id)

        # Delete the entry
        budget_entry.delete()

        return JsonResponse({'message': 'Budget entry deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
    
    except MonthlyBudget.DoesNotExist:
        return JsonResponse({'error': 'Budget entry not found.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_reports(request, user_id):
    try:
        # Get expense categories data
        expense_categories = Expense.objects.filter(
            user_id=user_id
        ).values('category').annotate(
            total=Sum('expense')
        ).order_by('-total')

        # Get monthly data for the last 6 months
        six_months_ago = datetime.now() - timedelta(days=180)
        monthly_data = Expense.objects.filter(
            user_id=user_id,
            date__gte=six_months_ago
        ).annotate(
            month=TruncMonth('date')
        ).values('month', 'category').annotate(
            total=Sum('expense')
        ).order_by('month')

        # Process monthly data into income vs expenses format
        processed_monthly_data = []
        current_month = None
        month_data = {'income': 0, 'expenses': 0}

        for item in monthly_data:
            month_str = item['month'].strftime('%B %Y')
            
            if current_month != month_str:
                if current_month:
                    processed_monthly_data.append({
                        'month': current_month,
                        'income': month_data['income'],
                        'expenses': month_data['expenses']
                    })
                current_month = month_str
                month_data = {'income': 0, 'expenses': 0}
            
            if item['category'] == 'income':
                month_data['income'] = item['total']
            else:
                month_data['expenses'] = item['total']

        # Add the last month
        if current_month:
            processed_monthly_data.append({
                'month': current_month,
                'income': month_data['income'],
                'expenses': month_data['expenses']
            })

        return Response({
            'expense_categories': list(expense_categories),
            'monthly_data': processed_monthly_data
        })

    except Exception as e:
        return Response({'error': str(e)}, status=400)