import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

# Параметры задачи
L = 3.0       # длина струны
c = 3.0       # скорость волны (c^2 = 9)
n = 12        # номер гармоники
omega_n = n * np.pi  # частота гармоники

# Функция решения u(x,t)
def u(x, t):
    return (1/(24 * np.pi)) * np.sin(12 * np.pi * t) * np.sin(4 * np.pi * x)

# Функция начальной скорости psi(x)
def psi(x):
    return 0.5 * np.sin(4 * np.pi * x)

# Создаем сетку по x
x = np.linspace(0, L, 1000)

# Создаем фигуру и оси
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8))
plt.suptitle('Сравнение решения u(x,t) и начальной скорости ψ(x)')

# Начальные графики
line_u, = ax1.plot(x, u(x, 0), 'b-', label=f'u(x,t=0)')
line_psi, = ax2.plot(x, psi(x), 'r-', label='ψ(x) = 0.5 sin(4πx)')

# Настройка осей
ax1.set_xlim(0, L)
ax1.set_ylim(-0.1, 0.1)
ax1.set_ylabel('u(x,t)')
ax1.grid(True)
ax1.legend()

ax2.set_xlim(0, L)
ax2.set_ylim(-0.6, 0.6)
ax2.set_ylabel('ψ(x)')
ax2.set_xlabel('x')
ax2.grid(True)
ax2.legend()

# Функция анимации
def update(t):
    t_val = t * 0.01  # медленное изменение времени для наглядности
    line_u.set_ydata(u(x, t_val))
    ax1.set_title(f'Решение u(x,t) в момент t = {t_val:.2f}')
    return line_u, line_psi

# Создаем анимацию
ani = FuncAnimation(fig, update, frames=200, interval=50, blit=True)

plt.tight_layout()
plt.show()