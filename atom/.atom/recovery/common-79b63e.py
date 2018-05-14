import numpy as np
import sympy as sp


def countFunc(func, start, end, counts):
    x = sp.symbols('x')
    r = np.linspace(start, end, num=counts).tolist()

    y = []
    for i in range(len(r)):
        y.append(func.subs(x, r[i]))

    # plt.plot(r, y)
    # plt.show()
    return y


def getMean(arr1, arr2):
    return np.mean(arr1 - arr2)
