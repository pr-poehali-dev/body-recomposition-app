-- Создание таблиц для фитнес-приложения

-- Таблица упражнений
CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    muscle_group VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица тренировочных планов
CREATE TABLE IF NOT EXISTS workout_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица упражнений в плане
CREATE TABLE IF NOT EXISTS plan_exercises (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES workout_plans(id),
    exercise_id INTEGER REFERENCES exercises(id),
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица тренировок
CREATE TABLE IF NOT EXISTS workouts (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES workout_plans(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица выполненных упражнений
CREATE TABLE IF NOT EXISTS workout_exercises (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER REFERENCES workouts(id),
    exercise_id INTEGER REFERENCES exercises(id),
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица продуктов
CREATE TABLE IF NOT EXISTS foods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    calories INTEGER NOT NULL,
    protein DECIMAL(5,2) NOT NULL,
    carbs DECIMAL(5,2) NOT NULL,
    fats DECIMAL(5,2) NOT NULL,
    serving_size VARCHAR(50),
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица приёмов пищи
CREATE TABLE IF NOT EXISTS meals (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time TIME NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица продуктов в приёме пищи
CREATE TABLE IF NOT EXISTS meal_foods (
    id SERIAL PRIMARY KEY,
    meal_id INTEGER REFERENCES meals(id),
    food_id INTEGER REFERENCES foods(id),
    quantity DECIMAL(8,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица статистики веса
CREATE TABLE IF NOT EXISTS weight_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
    weight DECIMAL(5,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица рекордов
CREATE TABLE IF NOT EXISTS personal_records (
    id SERIAL PRIMARY KEY,
    exercise_id INTEGER REFERENCES exercises(id),
    weight DECIMAL(5,2) NOT NULL,
    reps INTEGER NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exercise_id)
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
CREATE INDEX IF NOT EXISTS idx_weight_stats_date ON weight_stats(date);

-- Вставка примеров упражнений
INSERT INTO exercises (name, category, muscle_group) VALUES
('Жим штанги лёжа', 'Грудь', 'Грудные'),
('Приседания со штангой', 'Ноги', 'Квадрицепсы'),
('Становая тяга', 'Спина', 'Спина'),
('Жим гантелей сидя', 'Плечи', 'Дельты'),
('Подтягивания', 'Спина', 'Широчайшие'),
('Жим гантелей на наклонной', 'Грудь', 'Грудные'),
('Разгибания на трицепс', 'Руки', 'Трицепс'),
('Сгибания на бицепс', 'Руки', 'Бицепс');

-- Вставка примеров продуктов
INSERT INTO foods (name, calories, protein, carbs, fats, serving_size, is_custom) VALUES
('Куриная грудка', 165, 31.0, 0.0, 3.6, '100г', false),
('Рис белый', 130, 2.7, 28.0, 0.3, '100г', false),
('Овсянка', 389, 16.9, 66.3, 6.9, '100г', false),
('Банан', 89, 1.1, 23.0, 0.3, '1 шт', false),
('Творог 5%', 121, 16.0, 3.0, 5.0, '100г', false),
('Орехи грецкие', 654, 15.2, 14.0, 65.2, '100г', false),
('Рыба (лосось)', 208, 20.0, 0.0, 13.0, '100г', false),
('Овощи свежие', 30, 1.5, 6.0, 0.2, '100г', false);

-- Вставка примеров данных о весе
INSERT INTO weight_stats (date, weight) VALUES
(CURRENT_DATE - INTERVAL '6 days', 72.0),
(CURRENT_DATE - INTERVAL '5 days', 71.5),
(CURRENT_DATE - INTERVAL '4 days', 71.8),
(CURRENT_DATE - INTERVAL '3 days', 71.2),
(CURRENT_DATE - INTERVAL '2 days', 71.0),
(CURRENT_DATE - INTERVAL '1 day', 70.8),
(CURRENT_DATE, 70.5);