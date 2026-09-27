import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getTransactions, getSettings } from '../lib/queries';
import { CalendarSkeleton } from '../components/Skeletons';
import { getCycleDates } from '../lib/utils';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function CalendarView() {
  useDocumentTitle('Calendar');
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ salary_cycle_start_date: 1 });
  const [loading, setLoading] = useState(true);
  const [baseDate, setBaseDate] = useState<Date>(new Date());

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [txData, stData] = await Promise.all([
          getTransactions(),
          getSettings()
        ]);
        setTransactions(txData);
        setSettings(stData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const cycleDates = getCycleDates(settings.salary_cycle_start_date, baseDate);
  const cycleStart = cycleDates.start;
  const cycleEnd = cycleDates.end;

  // Generate calendar days
  const calendarDays = [];
  let currentDay = new Date(cycleStart);
  while (currentDay <= cycleEnd) {
    calendarDays.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }

  // Padding days at the beginning
  const startDayOfWeek = cycleStart.getDay();
  const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => i);

  // Month formatter for cycle info
  const formatMonthYear = (date: Date) => date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const cycleLabel = `${cycleStart.getDate()} ${formatMonthYear(cycleStart)} - ${cycleEnd.getDate()} ${formatMonthYear(cycleEnd)}`;

  const getDailyStats = (dateObj: Date) => {
    const dayTxns = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getDate() === dateObj.getDate() && 
             d.getMonth() === dateObj.getMonth() && 
             d.getFullYear() === dateObj.getFullYear();
    });

    const income = dayTxns.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
    const expense = dayTxns.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);

    return { income, expense };
  };

  const handlePrev = () => {
    const prev = new Date(baseDate);
    prev.setMonth(prev.getMonth() - 1);
    setBaseDate(prev);
  };

  const handleNext = () => {
    const next = new Date(baseDate);
    next.setMonth(next.getMonth() + 1);
    setBaseDate(next);
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Calendar</h1>
          <p className="text-slate-500 mt-1">View your daily cashflow across the salary cycle.</p>
        </div>
        <div className="flex flex-col items-start sm:items-end">
          <div className="flex items-center gap-4 mb-2">
            <button onClick={handlePrev} className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <ChevronLeft size={20} />
            </button>
            <span className="font-extrabold text-lg text-slate-800 text-center min-w-[150px]">Cycle</span>
            <button onClick={handleNext} className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <ChevronRight size={20} />
            </button>
          </div>
          <span className="text-sm font-medium text-slate-500">{cycleLabel}</span>
        </div>
      </div>

      <div className="glass-panel rounded-3xl md:rounded-[32px] p-4 md:p-8 overflow-hidden">
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4">
          {daysOfWeek.map(d => (
            <div key={d} className="text-center font-bold text-slate-400 text-sm">{d}</div>
          ))}
        </div>
        
        {loading ? (
          <CalendarSkeleton />
        ) : (
          <div className="grid grid-cols-7 gap-4">
            {paddingDays.map(p => (
              <div key={`pad-${p}`} className="min-h-[120px] rounded-2xl bg-white/30 border border-transparent"></div>
            ))}
            
            {calendarDays.map(dateObj => {
              const { income, expense } = getDailyStats(dateObj);
              const isToday = new Date().toDateString() === dateObj.toDateString();
              
              return (
                <div key={dateObj.toISOString()} className={`min-h-[120px] rounded-2xl ${isToday ? 'bg-indigo-50 border-indigo-200' : 'bg-white/70 border-white'} hover:border-indigo-300 transition-colors p-3 flex flex-col gap-2 cursor-pointer shadow-sm hover:shadow-md`}>
                  <div className="flex justify-between items-start">
                    <span className={`font-bold text-lg ${isToday ? 'text-indigo-600' : 'text-slate-700'}`}>
                      {dateObj.getDate()}
                    </span>
                    {isToday && <span className="w-2 h-2 rounded-full bg-indigo-500 mt-2"></span>}
                  </div>
                  
                  <div className="flex flex-col gap-1 mt-auto">
                    {income > 0 && (
                      <div className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md text-right truncate">
                        +{income >= 1000000 ? (income/1000000).toFixed(1) + 'M' : income >= 1000 ? (income/1000).toFixed(0) + 'K' : income}
                      </div>
                    )}
                    {expense > 0 && (
                      <div className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded-md text-right truncate">
                        -{expense >= 1000000 ? (expense/1000000).toFixed(1) + 'M' : expense >= 1000 ? (expense/1000).toFixed(0) + 'K' : expense}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
