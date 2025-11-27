'''
Business: API для управления данными фитнес-приложения (тренировки, питание, статистика)
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с attributes: request_id, function_name
Returns: HTTP response dict
'''

import json
import os
from typing import Dict, Any
from datetime import date, datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            action = params.get('action', 'exercises')
            
            if action == 'exercises':
                cur.execute('SELECT * FROM exercises ORDER BY category, name')
                exercises = cur.fetchall()
                result = {'exercises': [dict(row) for row in exercises]}
            
            elif action == 'foods':
                cur.execute('SELECT * FROM foods ORDER BY name')
                foods = cur.fetchall()
                result = {'foods': [dict(row) for row in foods]}
            
            elif action == 'weight_stats':
                cur.execute('SELECT * FROM weight_stats ORDER BY date DESC LIMIT 7')
                stats = cur.fetchall()
                result = {'weight_stats': [dict(row) for row in stats]}
            
            elif action == 'meals_today':
                cur.execute('''
                    SELECT m.id, m.name, m.time, 
                           COALESCE(SUM(f.calories * mf.quantity), 0) as calories,
                           COALESCE(SUM(f.protein * mf.quantity), 0) as protein
                    FROM meals m
                    LEFT JOIN meal_foods mf ON m.id = mf.meal_id
                    LEFT JOIN foods f ON mf.food_id = f.id
                    WHERE m.date = CURRENT_DATE
                    GROUP BY m.id, m.name, m.time
                    ORDER BY m.time
                ''')
                meals = cur.fetchall()
                result = {'meals': [dict(row) for row in meals]}
            
            elif action == 'workout_plans':
                cur.execute('SELECT * FROM workout_plans ORDER BY created_at DESC')
                plans = cur.fetchall()
                result = {'workout_plans': [dict(row) for row in plans]}
            
            elif action == 'personal_records':
                cur.execute('''
                    SELECT pr.*, e.name as exercise_name
                    FROM personal_records pr
                    JOIN exercises e ON pr.exercise_id = e.id
                    ORDER BY pr.date DESC
                ''')
                records = cur.fetchall()
                result = {'personal_records': [dict(row) for row in records]}
            
            else:
                result = {'error': 'Unknown action'}
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps(result, default=str)
            }
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'add_meal':
                meal_name = body_data.get('name')
                meal_time = body_data.get('time', datetime.now().strftime('%H:%M'))
                
                cur.execute(
                    "INSERT INTO meals (name, time, date) VALUES (%s, %s, CURRENT_DATE) RETURNING id",
                    (meal_name, meal_time)
                )
                meal_id = cur.fetchone()['id']
                conn.commit()
                
                result = {'meal_id': meal_id, 'status': 'created'}
            
            elif action == 'add_weight':
                weight_value = body_data.get('weight')
                cur.execute(
                    "INSERT INTO weight_stats (weight, date) VALUES (%s, CURRENT_DATE) ON CONFLICT (date) DO UPDATE SET weight = EXCLUDED.weight RETURNING id",
                    (weight_value,)
                )
                weight_id = cur.fetchone()['id']
                conn.commit()
                
                result = {'weight_id': weight_id, 'status': 'created'}
            
            elif action == 'add_workout_plan':
                plan_name = body_data.get('name')
                plan_desc = body_data.get('description', '')
                
                cur.execute(
                    "INSERT INTO workout_plans (name, description) VALUES (%s, %s) RETURNING id",
                    (plan_name, plan_desc)
                )
                plan_id = cur.fetchone()['id']
                conn.commit()
                
                result = {'plan_id': plan_id, 'status': 'created'}
            
            else:
                result = {'error': 'Unknown action'}
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps(result)
            }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }
