import numpy as np
import sympy as sp
import matplotlib.pyplot as plt
from common import countFunc, getMean


class Langrange:
    def __init__(self, xs, ys):
        self.xs = xs
        self.ys = ys
        self.x = sp.symbols('x')

    def base(point, others):
        x = sp.symbols('x')
        l = 1

        for i in range(len(others)):
            if others[i] == point:
                continue
            lTemp = (x - others[i]) / (point - others[i])
            l *= lTemp

        return l

    def langrange(xs, ys):
        ls = []
        for i in xs:
            point = i
            l = base(point, xs)

            ls.append(l)

    S = 0
    for i in range(len(ls)):
        S += ls[i] * ys[i]

    S = sp.simplify(S)
    return S


def fun():
    x = sp.symbols('x')
    return 1 / (1 + x ** 2)


if __name__ == '__main__':
    # drawGraph(fun(), -5, 5, 101)
    x = sp.symbols('x')
    # xs = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]
    xs = range(-5, 6)
    # xs = [2, 4, 6, 8]
    f = fun()
    ys = []
    for i in xs:
        ys.append(f.subs(x, i))

    lan = langrange(xs, ys)
    print(lan)
    # drawGraph(lan, -5, 5, 101)
    # drawGraph(f, -5, 5, 100)
    xlb = np.linspace(-5, 5, num=101).tolist()
    yLan = countFunc(lan, -5, 5, 101)
    yF = countFunc(f, -5, 5, 101)
    errorMean = getMean(np.array(yLan), np.array(yF))
    print(errorMean)

    plt.plot(xlb, yLan)
    plt.plot(xlb, yF)
    plt.show()
