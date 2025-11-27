import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

type TabType = 'home' | 'workouts' | 'nutrition' | 'stats';

interface Exercise {
  id: number;
  name: string;
  category: string;
  muscle_group: string;
}

interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
}

const API_URL = 'https://functions.poehali.dev/490cc87e-cdef-4d2c-bc3a-f629898a6281';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExercises();
    loadMeals();
  }, []);

  const loadExercises = async () => {
    try {
      const response = await fetch(`${API_URL}?action=exercises`);
      const data = await response.json();
      setExercises(data.exercises || []);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const loadMeals = async () => {
    try {
      const response = await fetch(`${API_URL}?action=meals_today`);
      const data = await response.json();
      setMeals(data.meals || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading meals:', error);
      setLoading(false);
    }
  };

  const todayStats = {
    calories: 1570,
    caloriesGoal: 2200,
    protein: 120,
    proteinGoal: 150,
    water: 1.8,
    waterGoal: 2.5,
    workouts: 1,
    workoutsGoal: 1,
  };

  const startRestTimer = (seconds: number) => {
    setRestTimer(seconds);
    setTimerActive(true);
    const interval = setInterval(() => {
      setRestTimer((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {activeTab === 'home' && (
        <div className="p-4 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Привет! 👋</h1>
              <p className="text-muted-foreground">Продолжай двигаться к цели</p>
            </div>
            <Button size="icon" variant="outline" className="rounded-full">
              <Icon name="Settings" size={20} />
            </Button>
          </div>

          <Card className="p-6 bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm opacity-90">Калории сегодня</p>
                <h2 className="text-4xl font-bold">{todayStats.calories}</h2>
                <p className="text-sm opacity-90">из {todayStats.caloriesGoal} ккал</p>
              </div>
              <div className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {Math.round((todayStats.calories / todayStats.caloriesGoal) * 100)}%
                </span>
              </div>
            </div>
            <Progress value={(todayStats.calories / todayStats.caloriesGoal) * 100} className="h-2 bg-white/20" />
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 hover-scale cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="Droplet" size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Вода</p>
                  <p className="text-xl font-bold">{todayStats.water}L</p>
                </div>
              </div>
              <Progress value={(todayStats.water / todayStats.waterGoal) * 100} className="h-1" />
            </Card>

            <Card className="p-4 hover-scale cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Icon name="Flame" size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Белок</p>
                  <p className="text-xl font-bold">{todayStats.protein}г</p>
                </div>
              </div>
              <Progress value={(todayStats.protein / todayStats.proteinGoal) * 100} className="h-1" />
            </Card>
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Сегодняшняя тренировка</h3>
              <Badge variant="secondary">Грудь + Трицепс</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">Жим штанги лёжа</span>
                <span className="text-sm text-muted-foreground">4x8</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">Жим гантелей на наклонной</span>
                <span className="text-sm text-muted-foreground">3x12</span>
              </div>
            </div>
            <Button className="w-full mt-4" size="lg">
              <Icon name="Play" size={20} className="mr-2" />
              Начать тренировку
            </Button>
          </Card>
        </div>
      )}

      {activeTab === 'workouts' && (
        <div className="p-4 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Тренировки</h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon" className="rounded-full">
                  <Icon name="Plus" size={20} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Создать план</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Название плана" />
                  <Button className="w-full">Создать</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="exercises" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="exercises">Упражнения</TabsTrigger>
              <TabsTrigger value="plans">Мои планы</TabsTrigger>
            </TabsList>
            <TabsContent value="exercises" className="space-y-3 mt-4">
              <Input placeholder="Поиск упражнений..." />
              <ScrollArea className="h-[calc(100vh-280px)]">
                {exercises.map((exercise) => (
                  <Card key={exercise.id} className="p-4 mb-3 hover-scale cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{exercise.name}</h3>
                        <p className="text-sm text-muted-foreground">{exercise.muscle_group}</p>
                      </div>
                      <Badge variant="outline">{exercise.category}</Badge>
                    </div>
                  </Card>
                ))}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="plans" className="space-y-3 mt-4">
              <Card className="p-4 hover-scale cursor-pointer">
                <h3 className="font-semibold mb-2">Push Day (Толкай)</h3>
                <p className="text-sm text-muted-foreground mb-3">Грудь, плечи, трицепс</p>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <Icon name="Play" size={16} className="mr-1" />
                    Начать
                  </Button>
                  <Button size="sm" variant="outline">
                    <Icon name="Edit" size={16} />
                  </Button>
                </div>
              </Card>
              <Card className="p-4 hover-scale cursor-pointer">
                <h3 className="font-semibold mb-2">Pull Day (Тяни)</h3>
                <p className="text-sm text-muted-foreground mb-3">Спина, бицепс</p>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <Icon name="Play" size={16} className="mr-1" />
                    Начать
                  </Button>
                  <Button size="sm" variant="outline">
                    <Icon name="Edit" size={16} />
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {timerActive && restTimer !== null && (
            <Card className="fixed bottom-24 left-4 right-4 p-6 bg-primary text-primary-foreground shadow-2xl animate-scale-in">
              <div className="text-center">
                <p className="text-sm opacity-90 mb-2">Отдых</p>
                <p className="text-5xl font-bold">{restTimer}с</p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setRestTimer(null);
                    setTimerActive(false);
                  }}
                >
                  Завершить
                </Button>
              </div>
            </Card>
          )}

          {!timerActive && (
            <div className="fixed bottom-24 left-4 right-4">
              <Button
                className="w-full"
                size="lg"
                onClick={() => startRestTimer(60)}
              >
                <Icon name="Timer" size={20} className="mr-2" />
                Запустить таймер отдыха (60с)
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'nutrition' && (
        <div className="p-4 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Питание</h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon" className="rounded-full">
                  <Icon name="Plus" size={20} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить приём пищи</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Название блюда" />
                  <Input type="number" placeholder="Калории" />
                  <Input type="number" placeholder="Белки (г)" />
                  <Button className="w-full">Добавить</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className="p-4 text-center">
              <Icon name="Flame" size={24} className="mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{todayStats.calories}</p>
              <p className="text-xs text-muted-foreground">Калории</p>
            </Card>
            <Card className="p-4 text-center">
              <Icon name="Beef" size={24} className="mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold">{todayStats.protein}г</p>
              <p className="text-xs text-muted-foreground">Белок</p>
            </Card>
            <Card className="p-4 text-center">
              <Icon name="Apple" size={24} className="mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">4</p>
              <p className="text-xs text-muted-foreground">Приёмов</p>
            </Card>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Сегодняшние приёмы</h2>
            <ScrollArea className="h-[calc(100vh-380px)]">
              {meals.map((meal) => (
                <Card key={meal.id} className="p-4 mb-3 hover-scale cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{meal.name}</h3>
                    <Badge variant="outline">{meal.time}</Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{meal.calories} ккал</span>
                    <span>{meal.protein}г белка</span>
                  </div>
                </Card>
              ))}
            </ScrollArea>
          </div>

          <Button className="w-full" size="lg" variant="outline">
            <Icon name="Book" size={20} className="mr-2" />
            Библиотека продуктов
          </Button>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="p-4 space-y-4 animate-fade-in">
          <h1 className="text-3xl font-bold mb-6">Аналитика</h1>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Вес</h2>
            <div className="h-48 flex items-end justify-between gap-2">
              {[72, 71.5, 71.8, 71.2, 71, 70.8, 70.5].map((weight, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary rounded-t-lg transition-all hover-scale"
                    style={{ height: `${(weight / 72) * 100}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{weight}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">Последние 7 дней</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Прогресс за месяц</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Тренировок</span>
                  <span className="font-bold">16 / 20</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Дней с калориями в норме</span>
                  <span className="font-bold">22 / 30</span>
                </div>
                <Progress value={73} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Потеря веса</span>
                  <span className="font-bold">-1.5 кг</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Рекорды</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="Award" size={24} className="text-primary" />
                  <div>
                    <p className="font-semibold">Жим лёжа</p>
                    <p className="text-sm text-muted-foreground">Максимальный вес</p>
                  </div>
                </div>
                <span className="text-xl font-bold">85 кг</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="Award" size={24} className="text-accent" />
                  <div>
                    <p className="font-semibold">Приседания</p>
                    <p className="text-sm text-muted-foreground">Максимальный вес</p>
                  </div>
                </div>
                <span className="text-xl font-bold">110 кг</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex items-center justify-around p-2">
          <Button
            variant={activeTab === 'home' ? 'default' : 'ghost'}
            size="lg"
            className="flex-col h-auto py-2 px-4 rounded-2xl"
            onClick={() => setActiveTab('home')}
          >
            <Icon name="Home" size={24} />
            <span className="text-xs mt-1">Главная</span>
          </Button>
          <Button
            variant={activeTab === 'workouts' ? 'default' : 'ghost'}
            size="lg"
            className="flex-col h-auto py-2 px-4 rounded-2xl"
            onClick={() => setActiveTab('workouts')}
          >
            <Icon name="Dumbbell" size={24} />
            <span className="text-xs mt-1">Тренировки</span>
          </Button>
          <Button
            variant={activeTab === 'nutrition' ? 'default' : 'ghost'}
            size="lg"
            className="flex-col h-auto py-2 px-4 rounded-2xl"
            onClick={() => setActiveTab('nutrition')}
          >
            <Icon name="Apple" size={24} />
            <span className="text-xs mt-1">Питание</span>
          </Button>
          <Button
            variant={activeTab === 'stats' ? 'default' : 'ghost'}
            size="lg"
            className="flex-col h-auto py-2 px-4 rounded-2xl"
            onClick={() => setActiveTab('stats')}
          >
            <Icon name="BarChart3" size={24} />
            <span className="text-xs mt-1">Статистика</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;