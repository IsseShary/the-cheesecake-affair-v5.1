
import React, { useState, useEffect, CSSProperties, useMemo, useRef, useContext, createContext } from 'react';
import { createRoot } from 'react-dom/client';

// --- TYPE DEFINITIONS ---
interface Sale {
  id: number;
  item: string;
  quantity: number;
  price: number;
  date: string;
  status: 'Paid' | 'Pending';
  vendorId: number | null;
  plasticContainers: {
    given: number;
    returned: number;
  };
}

interface Expense {
  id: number;
  description: string;
  category: 'Ingredients' | 'Plastic container' | 'Miscellaneous' | 'Others';
  amount: number;
  date: string;
  quantity?: number;
  unit?: 'kg' | 'g' | 'L' | 'ml' | 'pcs' | 'dozen';
}

interface Vendor {
    id: number;
    name: string;
    contact: string;
    isActive: boolean;
}

type View = 'dashboard' | 'sales' | 'expenses' | 'vendors' | 'p&l';

// --- MOCK DATA ---
const MOCK_VENDORS: Vendor[] = [
    { id: 1, name: 'Cake Supplies Co.', contact: '555-1234', isActive: true },
    { id: 2, name: 'Farm Fresh Dairy', contact: '555-5678', isActive: true },
    { id: 3, name: 'Packaging Pros', contact: '555-8765', isActive: true },
    { id: 4, name: 'Old Supplier', contact: '555-0000', isActive: false },
];

const MOCK_SALES: Sale[] = [
    { id: 1, item: 'Chocolate Cheesecake', quantity: 2, price: 25, date: '2024-07-20', status: 'Paid', vendorId: 1, plasticContainers: { given: 2, returned: 2 } },
    { id: 2, item: 'Strawberry Cheesecake', quantity: 1, price: 30, date: '2024-07-21', status: 'Pending', vendorId: 2, plasticContainers: { given: 1, returned: 0 } },
    { id: 3, item: 'Blueberry Cheesecake', quantity: 5, price: 28, date: '2024-07-22', status: 'Paid', vendorId: 1, plasticContainers: { given: 5, returned: 3 } },
];

const MOCK_EXPENSES: Expense[] = [
    { id: 1, description: 'Cream Cheese', category: 'Ingredients', amount: 50, date: '2024-07-19', quantity: 5, unit: 'kg' },
    { id: 2, description: '8-inch containers', category: 'Plastic container', amount: 30, date: '2024-07-18' },
    { id: 3, description: 'Electricity Bill', category: 'Miscellaneous', amount: 100, date: '2024-07-20' },
    { id: 4, description: 'Sugar', category: 'Ingredients', amount: 20, date: '2024-07-21', quantity: 10, unit: 'kg' },
];


// --- THEME CONTEXT ---
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });
const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// --- STYLES ---
const useStyles = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const colors = {
        background: isDark ? 'var(--background-dark)' : 'var(--background-light)',
        surface: isDark ? 'var(--surface-dark)' : 'var(--surface-light)',
        primary: isDark ? 'var(--primary-dark)' : 'var(--primary-light)',
        secondary: isDark ? 'var(--secondary-dark)' : 'var(--secondary-light)',
        textPrimary: isDark ? 'var(--text-primary-dark)' : 'var(--text-primary-light)',
        textSecondary: isDark ? 'var(--text-secondary-dark)' : 'var(--text-secondary-light)',
        border: isDark ? '#444' : '#eee',
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545',
    };

    const styles: { [key: string]: CSSProperties } = {
        // App Layout
        appContainer: {
            display: 'flex',
            minHeight: '100vh',
            transition: 'background-color 0.3s ease',
        },
        sidebar: {
            width: '240px',
            backgroundColor: colors.surface,
            padding: '20px',
            borderRight: `1px solid ${colors.border}`,
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            height: '100%',
            zIndex: 100,
            transition: 'transform 0.3s ease-in-out',
        },
        mainContent: {
            flex: 1,
            padding: '20px 40px',
            overflowY: 'auto',
            transition: 'margin-left 0.3s ease-in-out',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
        },
        pageTitle: {
            fontSize: '2rem',
            fontWeight: 600,
            color: colors.textPrimary,
        },

        // Components
        card: {
            backgroundColor: colors.surface,
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: `1px solid ${colors.border}`,
        },
        button: {
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '1rem',
            transition: 'all 0.2s ease',
        },
        input: {
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.background,
            color: colors.textPrimary,
            boxSizing: 'border-box',
            fontSize: '1rem',
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 500,
            color: colors.textSecondary,
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '1rem',
        },
        th: {
            padding: '12px',
            textAlign: 'left',
            borderBottom: `2px solid ${colors.border}`,
            fontWeight: 600,
        },
        td: {
            padding: '12px',
            textAlign: 'left',
            borderBottom: `1px solid ${colors.border}`,
        },
    };

    return { styles, colors, theme };
};


// --- ICONS ---
const Icon = ({ path, size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d={path} fill={color} />
    </svg>
);
const DashboardIcon = () => <Icon path="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />;
const SalesIcon = () => <Icon path="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM13 20.01L4 11V4h7l9 9-7 6.99z" />;
const ExpensesIcon = () => <Icon path="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm1 11h-8v-4h8v4zm2-6h-4v-2h4v2z" />;
const VendorsIcon = () => <Icon path="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />;
const PnLIcon = () => <Icon path="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-4h2v4zm0-6h-2v-2h2v2zm-4 6H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V7h2v2zm6 2h-2v-2h2v2z" />;
const SunIcon = () => <Icon path="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-1.41 11.32l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zM7.92 19.08l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" />;
const MoonIcon = () => <Icon path="M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z" />;
const MenuIcon = () => <Icon path="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />;
const CloseIcon = () => <Icon path="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />;

// --- HOOKS ---
const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            // If item doesn't exist, or is an empty array, use initial value
            const existing = item ? JSON.parse(item) : initialValue;
            return (Array.isArray(existing) && existing.length === 0) ? initialValue : existing;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
};

const useClickOutside = (ref, handler) => {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};

const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return windowSize;
};


// --- REUSABLE COMPONENTS ---
const Modal = ({ isOpen, onClose, title, children }) => {
    const { styles, colors } = useStyles();
    const modalRef = useRef(null);
    useClickOutside(modalRef, onClose);

    if (!isOpen) return null;

    const modalOverlayStyle: CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    };
    const modalContentStyle: CSSProperties = {
        ...styles.card,
        width: '90%',
        maxWidth: '500px',
    };
    const modalHeaderStyle: CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: '10px',
        marginBottom: '20px',
    };
    const closeButtonStyle: CSSProperties = {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: colors.textPrimary,
    };

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle} ref={modalRef}>
                <div style={modalHeaderStyle}>
                    <h2 style={{ margin: 0 }}>{title}</h2>
                    <button onClick={onClose} style={closeButtonStyle}>&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

const AutocompleteInput = ({ suggestions, value, onChange, placeholder }) => {
    const { styles } = useStyles();
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);
    useClickOutside(wrapperRef, () => setShowSuggestions(false));

    const handleChange = (e) => {
        const userInput = e.currentTarget.value;
        const newFilteredSuggestions = suggestions.filter(
            suggestion =>
                suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
        );
        setFilteredSuggestions(newFilteredSuggestions);
        setShowSuggestions(true);
        onChange(userInput);
    };

    const onClick = (suggestion) => {
        setFilteredSuggestions([]);
        setShowSuggestions(false);
        onChange(suggestion);
    };

    const suggestionsListComponent = (
        <ul style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: styles.card.backgroundColor,
            border: `1px solid ${styles.input.borderColor}`,
            borderRadius: '8px',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            maxHeight: '150px',
            overflowY: 'auto',
            zIndex: 2,
        }}>
            {filteredSuggestions.map((suggestion, index) => (
                <li key={index} onClick={() => onClick(suggestion)} style={{
                    padding: '10px',
                    cursor: 'pointer',
                }}>
                    {suggestion}
                </li>
            ))}
        </ul>
    );

    return (
        <div ref={wrapperRef} style={{ position: 'relative', marginBottom: '1rem' }}>
            <input
                type="text"
                onChange={handleChange}
                value={value}
                style={styles.input}
                placeholder={placeholder}
                onFocus={() => setShowSuggestions(true)}
            />
            {showSuggestions && value && filteredSuggestions.length ? suggestionsListComponent : null}
        </div>
    );
};


// --- VIEWS & FORMS ---

// --- DASHBOARD VIEW ---
const Dashboard = ({ sales, expenses, vendors }) => {
    const { styles, colors } = useStyles();
    const [timeFilter, setTimeFilter] = useState('all');

    const filteredData = useMemo(() => {
        const now = new Date();
        const filterDate = new Date();

        if (timeFilter === '7d') filterDate.setDate(now.getDate() - 7);
        else if (timeFilter === '30d') filterDate.setDate(now.getDate() - 30);
        else if (timeFilter === '1y') filterDate.setFullYear(now.getFullYear() - 1);
        else filterDate.setTime(0); // All time

        const filteredSales = sales.filter(s => new Date(s.date) >= filterDate);
        const filteredExpenses = expenses.filter(e => new Date(e.date) >= filterDate);

        return { sales: filteredSales, expenses: filteredExpenses };
    }, [sales, expenses, timeFilter]);


    const totalRevenue = filteredData.sales.reduce((sum, sale) => sum + (sale.status === 'Paid' ? sale.price * sale.quantity : 0), 0);
    const totalExpenses = filteredData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const profit = totalRevenue - totalExpenses;
    const pendingPayments = sales.reduce((sum, sale) => sum + (sale.status === 'Pending' ? sale.price * sale.quantity : 0), 0);

    const recentActivities = [...sales, ...expenses]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
        
    const getVendorName = (vendorId) => vendors.find(v => v.id === vendorId)?.name || 'N/A';
    
    // Chart Data
    const chartData = useMemo(() => {
        const dataPoints = {};
        [...filteredData.sales, ...filteredData.expenses].forEach(item => {
            const date = new Date(item.date).toISOString().split('T')[0];
            if (!dataPoints[date]) {
                dataPoints[date] = { revenue: 0, expense: 0 };
            }
            if ('item' in item) { // It's a sale
                dataPoints[date].revenue += item.price * item.quantity;
            } else { // It's an expense
                dataPoints[date].expense += item.amount;
            }
        });

        const sortedDates = Object.keys(dataPoints).sort();
        let cumulativeProfit = 0;
        return sortedDates.map(date => {
            const { revenue, expense } = dataPoints[date];
            cumulativeProfit += revenue - expense;
            return { date, profit: cumulativeProfit };
        });
    }, [filteredData]);


    const LineChart = ({ data }) => {
        if (data.length < 2) return <p style={{ color: colors.textSecondary, textAlign: 'center' }}>Not enough data to display chart.</p>;

        const width = 500, height = 200, padding = 40;
        const profits = data.map(d => d.profit);
        const minProfit = Math.min(...profits, 0);
        const maxProfit = Math.max(...profits, 0);

        const getY = (profit) => {
            const range = maxProfit - minProfit;
            if (range === 0) return height - padding;
            return height - padding - ((profit - minProfit) / range) * (height - 2 * padding);
        };
        const getX = (i) => padding + (i / (data.length - 1)) * (width - 2 * padding);
        
        const path = "M" + data.map((d, i) => `${getX(i)} ${getY(d.profit)}`).join(" L");

        return (
             <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
                {/* Y-axis labels */}
                <text x="5" y={padding + 5} fontSize="10" fill={colors.textSecondary}>${maxProfit.toFixed(0)}</text>
                <text x="5" y={height - padding + 5} fontSize="10" fill={colors.textSecondary}>${minProfit.toFixed(0)}</text>
                
                {/* X-axis labels */}
                <text x={padding} y={height - padding + 20} fontSize="10" fill={colors.textSecondary}>{data[0].date}</text>
                <text x={width - padding - 50} y={height - padding + 20} fontSize="10" fill={colors.textSecondary}>{data[data.length - 1].date}</text>


                <path d={path} fill="none" stroke={colors.primary} strokeWidth="2" />
            </svg>
        );
    };

    const TimeFilterButtons = () => (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['7d', '30d', '1y', 'all'].map(period => (
                <button
                    key={period}
                    onClick={() => setTimeFilter(period)}
                    style={{
                        ...styles.button,
                        backgroundColor: timeFilter === period ? colors.primary : colors.surface,
                        color: timeFilter === period ? 'white' : colors.textPrimary,
                        padding: '5px 15px',
                        border: `1px solid ${colors.primary}`,
                    }}
                >
                    {period.toUpperCase()}
                </button>
            ))}
        </div>
    );
    
    return (
        <div>
            <div style={styles.header}>
                <h1 style={styles.pageTitle}>Dashboard</h1>
                <TimeFilterButtons />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div style={styles.card}>
                    <h3 style={{ marginTop: 0, color: colors.textSecondary }}>Total Revenue</h3>
                    <p style={{ fontSize: '2rem', margin: 0, fontWeight: 600, color: colors.success }}>${totalRevenue.toFixed(2)}</p>
                </div>
                <div style={styles.card}>
                    <h3 style={{ marginTop: 0, color: colors.textSecondary }}>Total Expenses</h3>
                    <p style={{ fontSize: '2rem', margin: 0, fontWeight: 600, color: colors.error }}>${totalExpenses.toFixed(2)}</p>
                </div>
                 <div style={styles.card}>
                    <h3 style={{ marginTop: 0, color: colors.textSecondary }}>Profit</h3>
                    <p style={{ fontSize: '2rem', margin: 0, fontWeight: 600, color: profit >= 0 ? colors.success : colors.error }}>${profit.toFixed(2)}</p>
                </div>
                <div style={styles.card}>
                    <h3 style={{ marginTop: 0, color: colors.textSecondary }}>Pending Payments</h3>
                    <p style={{ fontSize: '2rem', margin: 0, fontWeight: 600, color: colors.warning }}>${pendingPayments.toFixed(2)}</p>
                </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                <div style={styles.card}>
                    <h3 style={{ marginTop: 0 }}>Profit Trend</h3>
                    <LineChart data={chartData} />
                </div>
                <div style={styles.card}>
                    <h3 style={{ marginTop: 0 }}>Recent Activities</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '250px', overflowY: 'auto' }}>
                        {recentActivities.map(activity => (
                             <li key={activity.id + ('item' in activity ? 's' : 'e')} style={{ borderBottom: `1px solid ${colors.border}`, padding: '10px 0' }}>
                                {'item' in activity ? (
                                    <div style={{color: activity.status === 'Paid' ? colors.success : colors.warning}}>
                                        <strong>Sale:</strong> {activity.quantity}x {activity.item} to {getVendorName(activity.vendorId)} - ${activity.price * activity.quantity}
                                    </div>
                                ) : (
                                    <div style={{color: colors.error}}>
                                        <strong>Expense:</strong> {activity.description} - ${activity.amount}
                                    </div>
                                )}
                                <div style={{ fontSize: '0.8rem', color: colors.textSecondary }}>{activity.date}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

        </div>
    );
};


// --- SALES VIEW ---
const AddSaleForm = ({ onSave, onCancel, vendors, existingSale, itemSuggestions }) => {
    const { styles, colors } = useStyles();
    const [sale, setSale] = useState(
        existingSale || {
            item: '',
            quantity: 1,
            price: 0,
            date: new Date().toISOString().split('T')[0],
            status: 'Pending',
            vendorId: vendors.length > 0 ? vendors[0].id : null,
            plasticContainers: { given: 0, returned: 0 },
        }
    );

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if(name === 'plasticContainers.given' || name === 'plasticContainers.returned') {
            const [parent, child] = name.split('.');
            setSale(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: Number(value) }}));
        } else {
             setSale(prev => ({
                ...prev,
                [name]: type === 'number' ? Number(value) : value,
            }));
        }
    };
    
    const handleItemChange = (value) => {
        setSale(prev => ({...prev, item: value}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(sale);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{marginBottom: '1rem'}}>
                <label style={styles.label}>Item Name</label>
                <AutocompleteInput
                    suggestions={itemSuggestions}
                    value={sale.item}
                    onChange={handleItemChange}
                    placeholder="e.g., Chocolate Cheesecake"
                />
            </div>
            <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                <div style={{flex: 1}}>
                    <label style={styles.label}>Quantity</label>
                    <input style={styles.input} type="number" name="quantity" value={sale.quantity} onChange={handleChange} placeholder="e.g., 2" min="1" />
                </div>
                <div style={{flex: 1}}>
                    <label style={styles.label}>Price (per item)</label>
                    <input style={styles.input} type="number" name="price" value={sale.price} onChange={handleChange} placeholder="e.g., 25.00" step="0.01" />
                </div>
            </div>
            <div style={{marginBottom: '1rem'}}>
                <label style={styles.label}>Date of Sale</label>
                <input style={styles.input} type="date" name="date" value={sale.date} onChange={handleChange} />
            </div>
            <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                <div style={{flex: 1}}>
                    <label style={styles.label}>Payment Status</label>
                    <select style={styles.input} name="status" value={sale.status} onChange={handleChange}>
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                    </select>
                </div>
                <div style={{flex: 1}}>
                    <label style={styles.label}>Vendor</label>
                    <select style={styles.input} name="vendorId" value={sale.vendorId || ''} onChange={handleChange}>
                        <option value="">Select Vendor</option>
                        {vendors.filter(v => v.isActive).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                </div>
            </div>
            <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
                 <div style={{flex: 1}}>
                    <label style={styles.label}>Containers Given</label>
                    <input style={styles.input} type="number" name="plasticContainers.given" value={sale.plasticContainers.given} onChange={handleChange} min="0" />
                 </div>
                 <div style={{flex: 1}}>
                    <label style={styles.label}>Containers Returned</label>
                    <input style={styles.input} type="number" name="plasticContainers.returned" value={sale.plasticContainers.returned} onChange={handleChange} min="0" />
                 </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={onCancel} style={{ ...styles.button, backgroundColor: styles.card.backgroundColor, color: colors.textPrimary, border: `1px solid ${colors.border}` }}>Cancel</button>
                <button type="submit" style={{ ...styles.button, backgroundColor: colors.primary, color: 'white' }}>Save Sale</button>
            </div>
        </form>
    );
};

const SalesView = ({ sales, vendors, onAddSale, onUpdateSale, onDeleteSale }) => {
    const { styles, colors } = useStyles();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSale, setEditingSale] = useState(null);

    const handleSave = (sale) => {
        if (editingSale) {
            onUpdateSale({ ...sale, id: editingSale.id });
        } else {
            onAddSale(sale);
        }
        setIsModalOpen(false);
        setEditingSale(null);
    };
    
    const openAddModal = () => {
        setEditingSale(null);
        setIsModalOpen(true);
    };

    const openEditModal = (sale) => {
        setEditingSale(sale);
        setIsModalOpen(true);
    };
    
    const itemSuggestions = useMemo(() => [...new Set(sales.map(s => s.item))], [sales]);
    const getVendorName = (vendorId) => vendors.find(v => v.id === vendorId)?.name || 'N/A';
    
    return (
        <div>
            <div style={styles.header}>
                <h1 style={styles.pageTitle}>Sales</h1>
                <button onClick={openAddModal} style={{ ...styles.button, backgroundColor: colors.primary, color: 'white' }}>+ Add Sale</button>
            </div>
            
            <div style={{...styles.card, overflowX: 'auto'}}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Item</th>
                            <th style={styles.th}>Qty</th>
                            <th style={styles.th}>Total Price</th>
                            <th style={styles.th}>Vendor</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Containers</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map(sale => (
                            <tr key={sale.id}>
                                <td style={styles.td}>{sale.date}</td>
                                <td style={styles.td}>{sale.item}</td>
                                <td style={styles.td}>{sale.quantity}</td>
                                <td style={styles.td}>${(sale.quantity * sale.price).toFixed(2)}</td>
                                <td style={styles.td}>{getVendorName(sale.vendorId)}</td>
                                <td style={styles.td}><span style={{
                                    backgroundColor: sale.status === 'Paid' ? colors.success : colors.warning,
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem'
                                }}>{sale.status}</span></td>
                                <td style={styles.td}>{sale.plasticContainers.given - sale.plasticContainers.returned} outstanding</td>
                                <td style={styles.td}>
                                    <button onClick={() => openEditModal(sale)}>Edit</button>
                                    <button onClick={() => onDeleteSale(sale.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSale ? 'Edit Sale' : 'Add New Sale'}>
                <AddSaleForm
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                    vendors={vendors}
                    existingSale={editingSale}
                    itemSuggestions={itemSuggestions}
                />
            </Modal>
        </div>
    );
};

// --- EXPENSES VIEW ---
const AddExpenseForm = ({ onSave, onCancel, existingExpense, descriptionSuggestions }) => {
    const { styles, colors } = useStyles();
    const [expense, setExpense] = useState(
        existingExpense || {
            description: '',
            category: 'Ingredients',
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            quantity: '',
            unit: '',
        }
    );
    
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setExpense(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };
    
    const handleDescriptionChange = (value) => {
        setExpense(prev => ({...prev, description: value}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(expense);
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <div style={{marginBottom: '1rem'}}>
                <label style={styles.label}>Description</label>
                <AutocompleteInput
                    suggestions={descriptionSuggestions}
                    value={expense.description}
                    onChange={handleDescriptionChange}
                    placeholder="e.g., Cream Cheese"
                />
            </div>
            <div style={{marginBottom: '1rem'}}>
                <label style={styles.label}>Category</label>
                <select name="category" value={expense.category} onChange={handleChange} style={styles.input}>
                    <option value="Ingredients">Ingredients</option>
                    <option value="Plastic container">Plastic container</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                    <option value="Others">Others</option>
                </select>
            </div>

            {expense.category === 'Ingredients' && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={styles.label}>Quantity</label>
                        <input style={styles.input} type="number" name="quantity" value={expense.quantity || ''} onChange={handleChange} placeholder="e.g., 2.5" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={styles.label}>Unit</label>
                        <select style={styles.input} name="unit" value={expense.unit || ''} onChange={handleChange}>
                            <option value="">N/A</option>
                            <option value="kg">Kilogram (kg)</option>
                            <option value="g">Gram (g)</option>
                            <option value="L">Liter (L)</option>
                            <option value="ml">Milliliter (ml)</option>
                            <option value="pcs">Pieces (pcs)</option>
                            <option value="dozen">Dozen</option>
                        </select>
                    </div>
                </div>
            )}

            <div style={{marginBottom: '1rem'}}>
                 <label style={styles.label}>Total Amount</label>
                <input style={styles.input} type="number" name="amount" value={expense.amount} onChange={handleChange} placeholder="e.g., 50.00" step="0.01" />
            </div>
             <div style={{marginBottom: '1rem'}}>
                <label style={styles.label}>Date of Expense</label>
                <input style={styles.input} type="date" name="date" value={expense.date} onChange={handleChange} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={onCancel} style={{ ...styles.button, backgroundColor: styles.card.backgroundColor, color: colors.textPrimary, border: `1px solid ${colors.border}` }}>Cancel</button>
                <button type="submit" style={{ ...styles.button, backgroundColor: colors.primary, color: 'white' }}>Save Expense</button>
            </div>
        </form>
    );
};


const ExpensesView = ({ expenses, onAddExpense, onUpdateExpense, onDeleteExpense }) => {
    const { styles, colors } = useStyles();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    const handleSave = (expense) => {
        if (editingExpense) {
            onUpdateExpense({ ...expense, id: editingExpense.id });
        } else {
            onAddExpense(expense);
        }
        setIsModalOpen(false);
        setEditingExpense(null);
    };

    const openAddModal = () => {
        setEditingExpense(null);
        setIsModalOpen(true);
    };

    const openEditModal = (expense) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };
    
    const descriptionSuggestions = useMemo(() => [...new Set(expenses.map(e => e.description))], [expenses]);

    return (
        <div>
            <div style={styles.header}>
                <h1 style={styles.pageTitle}>Expenses</h1>
                <button onClick={openAddModal} style={{...styles.button, backgroundColor: colors.primary, color: 'white'}}>+ Add Expense</button>
            </div>

            <div style={{...styles.card, overflowX: 'auto'}}>
                 <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Details</th>
                            <th style={styles.th}>Category</th>
                            <th style={styles.th}>Amount</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map(expense => (
                            <tr key={expense.id}>
                                <td style={styles.td}>{expense.date}</td>
                                <td style={styles.td}>
                                    {expense.description}
                                    {expense.quantity && expense.unit && ` (${expense.quantity} ${expense.unit})`}
                                </td>
                                <td style={styles.td}>{expense.category}</td>
                                <td style={styles.td}>${expense.amount.toFixed(2)}</td>
                                <td style={styles.td}>
                                    <button onClick={() => openEditModal(expense)}>Edit</button>
                                    <button onClick={() => onDeleteExpense(expense.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingExpense ? 'Edit Expense' : 'Add New Expense'}>
                <AddExpenseForm
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                    existingExpense={editingExpense}
                    descriptionSuggestions={descriptionSuggestions}
                />
            </Modal>
        </div>
    );
};


// --- VENDORS VIEW ---
const AddVendorForm = ({ onSave, onCancel, existingVendor }) => {
    const { styles, colors } = useStyles();
    const [vendor, setVendor] = useState(
        existingVendor || { name: '', contact: '', isActive: true }
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setVendor(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(vendor);
    };

    return (
         <form onSubmit={handleSubmit}>
            <div style={{marginBottom: '1rem'}}>
                <label style={styles.label}>Vendor Name</label>
                <input style={styles.input} type="text" name="name" value={vendor.name} onChange={handleChange} placeholder="e.g., Cake Supplies Co." required />
            </div>
            <div style={{marginBottom: '1rem'}}>
                 <label style={styles.label}>Contact Info</label>
                <input style={styles.input} type="text" name="contact" value={vendor.contact} onChange={handleChange} placeholder="e.g., 555-1234" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={onCancel} style={{...styles.button, backgroundColor: 'transparent', color: colors.textPrimary, border: `1px solid ${colors.border}`}}>Cancel</button>
                <button type="submit" style={{...styles.button, backgroundColor: colors.primary, color: 'white'}}>Save Vendor</button>
            </div>
        </form>
    );
};

const VendorsView = ({ vendors, onAddVendor, onUpdateVendor, onDeleteVendor, onRestoreVendor }) => {
    const { styles, colors } = useStyles();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [view, setView] = useState('active'); // 'active' or 'history'

    const handleSave = (vendor) => {
        if (editingVendor) {
            onUpdateVendor({ ...vendor, id: editingVendor.id });
        } else {
            onAddVendor(vendor);
        }
        setIsModalOpen(false);
        setEditingVendor(null);
    };
    
    const openAddModal = () => {
        setEditingVendor(null);
        setIsModalOpen(true);
    };

    const openEditModal = (vendor) => {
        setEditingVendor(vendor);
        setIsModalOpen(true);
    };
    
    const activeVendors = vendors.filter(v => v.isActive);
    const inactiveVendors = vendors.filter(v => !v.isActive);

    const vendorsToDisplay = view === 'active' ? activeVendors : inactiveVendors;

    return (
        <div>
            <div style={styles.header}>
                <h1 style={styles.pageTitle}>Vendors</h1>
                <button onClick={openAddModal} style={{ ...styles.button, backgroundColor: colors.primary, color: 'white' }}>+ Add Vendor</button>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
                <button onClick={() => setView('active')} style={{...styles.button, backgroundColor: view === 'active' ? colors.primary : 'transparent', color: view === 'active' ? 'white' : colors.textPrimary }}>Active</button>
                <button onClick={() => setView('history')} style={{...styles.button, backgroundColor: view === 'history' ? colors.primary : 'transparent', color: view === 'history' ? 'white' : colors.textPrimary }}>History</button>
            </div>

            <div style={{...styles.card, overflowX: 'auto'}}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Contact</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendorsToDisplay.map(vendor => (
                            <tr key={vendor.id}>
                                <td style={styles.td}>{vendor.name}</td>
                                <td style={styles.td}>{vendor.contact}</td>
                                <td style={styles.td}>
                                    {view === 'active' ? (
                                        <>
                                            <button onClick={() => openEditModal(vendor)}>Edit</button>
                                            <button onClick={() => onDeleteVendor(vendor.id)}>Delete</button>
                                        </>
                                    ) : (
                                        <button onClick={() => onRestoreVendor(vendor.id)}>Restore</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingVendor ? 'Edit Vendor' : 'Add New Vendor'}>
                <AddVendorForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} existingVendor={editingVendor} />
            </Modal>
        </div>
    );
};

// --- PROFIT & LOSS VIEW ---
const ProfitLossView = ({ sales, expenses }) => {
    const { styles, colors } = useStyles();
    const [timeFilter, setTimeFilter] = useState('all');

    const filteredData = useMemo(() => {
        const now = new Date();
        const filterDate = new Date();

        if (timeFilter === '7d') filterDate.setDate(now.getDate() - 7);
        else if (timeFilter === '30d') filterDate.setDate(now.getDate() - 30);
        else if (timeFilter === '1y') filterDate.setFullYear(now.getFullYear() - 1);
        else filterDate.setTime(0);

        const filteredSales = sales.filter(s => new Date(s.date) >= filterDate && s.status === 'Paid');
        const filteredExpenses = expenses.filter(e => new Date(e.date) >= filterDate);

        return { sales: filteredSales, expenses: filteredExpenses };
    }, [sales, expenses, timeFilter]);

    const totalRevenue = filteredData.sales.reduce((sum, sale) => sum + sale.price * sale.quantity, 0);
    const totalExpenses = filteredData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    
    const TimeFilterButtons = () => (
         <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['7d', '30d', '1y', 'all'].map(period => (
                <button
                    key={period}
                    onClick={() => setTimeFilter(period)}
                    style={{
                        ...styles.button,
                        backgroundColor: timeFilter === period ? colors.primary : colors.surface,
                        color: timeFilter === period ? 'white' : colors.textPrimary,
                        padding: '5px 15px',
                        border: `1px solid ${colors.primary}`,
                    }}
                >
                    {period.toUpperCase()}
                </button>
            ))}
        </div>
    );

    return (
        <div>
            <div style={styles.header}>
                <h1 style={styles.pageTitle}>Profit & Loss Statement</h1>
                <TimeFilterButtons />
            </div>
            <div style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `2px solid ${colors.border}` }}>
                    <h2 style={{margin: 0}}>Total Revenue</h2>
                    <h2 style={{margin: 0, color: colors.success}}>${totalRevenue.toFixed(2)}</h2>
                </div>
                {filteredData.sales.map(sale => (
                     <div key={sale.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 20px', borderBottom: `1px solid ${colors.border}` }}>
                        <span>{sale.date} - {sale.item}</span>
                        <span>${(sale.price * sale.quantity).toFixed(2)}</span>
                    </div>
                ))}
                
                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `2px solid ${colors.border}`, marginTop: '2rem' }}>
                    <h2 style={{margin: 0}}>Total Expenses</h2>
                    <h2 style={{margin: 0, color: colors.error}}>${totalExpenses.toFixed(2)}</h2>
                </div>
                {filteredData.expenses.map(expense => (
                     <div key={expense.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 20px', borderBottom: `1px solid ${colors.border}` }}>
                        <span>{expense.date} - {expense.description}</span>
                        <span>${expense.amount.toFixed(2)}</span>
                    </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', marginTop: '2rem', borderTop: `2px solid ${colors.textPrimary}` }}>
                    <h2 style={{margin: 0}}>Net Profit</h2>
                    <h2 style={{margin: 0, color: netProfit >= 0 ? colors.success : colors.error}}>${netProfit.toFixed(2)}</h2>
                </div>
            </div>
        </div>
    );
};


// --- APP ---
const App = () => {
    const { styles, colors, theme } = useStyles();
    const { toggleTheme } = useTheme();
    const { width } = useWindowSize();
    const isMobile = width < 768;
    const sidebarRef = useRef(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [view, setView] = useLocalStorage('app-view', 'dashboard');
    const [sales, setSales] = useLocalStorage('app-sales', MOCK_SALES);
    const [expenses, setExpenses] = useLocalStorage('app-expenses', MOCK_EXPENSES);
    const [vendors, setVendors] = useLocalStorage('app-vendors', MOCK_VENDORS);
    
    useClickOutside(sidebarRef, () => {
        if(isMobile && isSidebarOpen) {
            setIsSidebarOpen(false);
        }
    });

    // CRUD Operations
    const addSale = (sale) => setSales(prev => [...prev, { ...sale, id: Date.now() }]);
    const updateSale = (updated) => setSales(prev => prev.map(s => s.id === updated.id ? updated : s));
    const deleteSale = (id) => setSales(prev => prev.filter(s => s.id !== id));

    const addExpense = (expense) => setExpenses(prev => [...prev, { ...expense, id: Date.now() }]);
    const updateExpense = (updated) => setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
    const deleteExpense = (id) => setExpenses(prev => prev.filter(e => e.id !== id));
    
    const addVendor = (vendor) => setVendors(prev => [...prev, { ...vendor, id: Date.now(), isActive: true }]);
    const updateVendor = (updated) => setVendors(prev => prev.map(v => v.id === updated.id ? updated : v));
    const deleteVendor = (id) => setVendors(prev => prev.map(v => v.id === id ? {...v, isActive: false} : v));
    const restoreVendor = (id) => setVendors(prev => prev.map(v => v.id === id ? {...v, isActive: true} : v));

    const renderView = () => {
        switch (view) {
            case 'sales': return <SalesView sales={sales} vendors={vendors} onAddSale={addSale} onUpdateSale={updateSale} onDeleteSale={deleteSale} />;
            case 'expenses': return <ExpensesView expenses={expenses} onAddExpense={addExpense} onUpdateExpense={updateExpense} onDeleteExpense={deleteExpense} />;
            case 'vendors': return <VendorsView vendors={vendors} onAddVendor={addVendor} onUpdateVendor={updateVendor} onDeleteVendor={deleteVendor} onRestoreVendor={restoreVendor} />;
            case 'p&l': return <ProfitLossView sales={sales} expenses={expenses} />;
            case 'dashboard':
            default:
                return <Dashboard sales={sales} expenses={expenses} vendors={vendors} />;
        }
    };
    
    const NavItem = ({ icon, label, targetView }) => {
        const isActive = view === targetView;
        const navItemStyle: CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            padding: '12px 15px',
            borderRadius: '8px',
            marginBottom: '10px',
            cursor: 'pointer',
            backgroundColor: isActive ? colors.primary : 'transparent',
            color: isActive ? 'white' : colors.textSecondary,
            fontWeight: isActive ? 600 : 500,
            transition: 'all 0.2s ease-in-out',
        };
        const handleNav = () => {
            setView(targetView);
            if (isMobile) {
                setIsSidebarOpen(false);
            }
        };
        return (
            <div style={navItemStyle} onClick={handleNav}>
                <div style={{ marginRight: '15px' }}>{icon}</div>
                <span>{label}</span>
            </div>
        );
    };

    const sidebarStyle: CSSProperties = {
        ...styles.sidebar,
        ...(isMobile && {
            transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            boxShadow: isSidebarOpen ? '0 0 20px rgba(0,0,0,0.2)' : 'none',
        })
    };
    
    const mainContentStyle: CSSProperties = {
        ...styles.mainContent,
        marginLeft: isMobile ? '0' : styles.sidebar.width,
        padding: isMobile ? '20px 15px' : '20px 40px'
    };
    
    const mobileMenuButtonStyle: CSSProperties = {
        position: 'fixed',
        top: '15px',
        left: '15px',
        zIndex: 99,
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        color: colors.textPrimary,
    };
    
    return (
        <div style={styles.appContainer}>
            {isMobile && <button onClick={() => setIsSidebarOpen(true)} style={mobileMenuButtonStyle}><MenuIcon /></button>}
            <aside style={sidebarStyle} ref={sidebarRef}>
                 <div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <h1 style={{ color: colors.primary, marginBottom: '2rem', fontSize: '1.5rem' }}>The Cheesecake Affair</h1>
                        {isMobile && <button onClick={() => setIsSidebarOpen(false)} style={{background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary}}><CloseIcon /></button>}
                    </div>
                    <NavItem icon={<DashboardIcon />} label="Dashboard" targetView="dashboard" />
                    <NavItem icon={<SalesIcon />} label="Sales" targetView="sales" />
                    <NavItem icon={<ExpensesIcon />} label="Expenses" targetView="expenses" />
                    <NavItem icon={<VendorsIcon />} label="Vendors" targetView="vendors" />
                    <NavItem icon={<PnLIcon />} label="P&L" targetView="p&l" />
                </div>
                 <div style={{ marginTop: 'auto' }}>
                    <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary }}>
                        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                    </button>
                </div>
            </aside>
            <main style={mainContentStyle}>
                {renderView()}
            </main>
        </div>
    );
};


const root = createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </React.StrictMode>
);