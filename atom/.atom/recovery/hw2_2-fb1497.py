# -*- coding:utf-8 -*-
"""
@author: Hgy
@file: hw2_2.py
@time: 2017/12/25 9:08
"""
import numpy as np
import matplotlib.pyplot as plt
import math
from fractions import Fraction

wji = [1, 1, 1, 1]
row = len(wji)
wkj = [1, 1]
row2 = len(wkj)
LEARNING_RATE = 0.01


def tanh(x):
    # y = (np.exp(x) - np.exp(-1 * x)) / (np.exp(x) + np.exp(-1 * x))
    return np.tanh(x)


def initWeight_b():
    for i in range(row):
        wji[i] = 0.5
    for i in range(row2):
        wkj[i] = -0.5
    print "initWeight_b"
    print wji, wkj


def initWeight_a():
    for i in range(row):
        wji[i] = np.random.uniform(-1, 1)
    for i in range(row2):
        wkj[i] = np.random.uniform(-1, 1)
    print "initWeight_a"
    print wji, wkj


def activation(net_j):
    a = 1.716
    b = Fraction(2, 3)
    # y = 2 * a / (1 + math.exp(-1 * b * net_j)) - a
    y = a * tanh(b * net_j)
    return y


def sign(y):
    if y >= 0:
        return 1
    else:
        return -1


def forward(x1, x2, x3, bias=1):
    x = [x1, x2, x3, bias]
    # layer1
    net_h1 = 0
    for i in range(row):
        net_h1 += x[i] * wji[i]
    out_h1 = activation(net_h1)

    x_ = [out_h1, bias]
    net_o1 = 0
    # layer2
    for i in range(row2):
        net_o1 += x_[i] * wkj[i]
    out_o1 = activation(net_o1)
    # print "result:",out_o1
    return out_o1, out_h1


def fun(net_j):
    a = 1.716
    b = 2.0 / 3.0
    y = net_j/a
    # print result
    result = a * b * (1 - y * y)
    return result


def BPtrain(x1, x2, x3, y):
    x = [x1, x2, x3, 1]
    out_o1, out_h1 = forward(x1, x2, x3, bias=1)
    w4 = wkj[0]
    bias = wkj[1]
    # E_total = 0.5*(y-out_o1)*(y-out_o1)
    delta_output_hidden = (out_o1 - y) * fun(out_o1)
    delta_w4 = delta_output_hidden * out_h1
    delta_bias = delta_output_hidden
    wkj[0] = wkj[0] - LEARNING_RATE * delta_w4
    wkj[1] = wkj[1] - LEARNING_RATE * delta_bias



    delta_hidden_input = (out_o1 - y) * fun(out_o1) * w4 * fun(out_h1)
    for i in range(row):
        wji[i] = wji[i] - LEARNING_RATE * delta_hidden_input * x[i]
        # out_o1, out_h1 = forward(x1, x2, x3, bias=1)
        # print out_o1
    # print "~~~BPtrain~~~~~"
    # print out_o1, y, delta_output_hidden
    # print "~~~BPtrain~~~~"

def data():
    x = [[0.28, 1.31, -6.2], [0.07, 0.58, -0.78], [1.54, 2.01, -1.63],
         [-0.44, 1.18, -4.32], [-0.81, 0.21, 5.73], [1.52, 3.16, 2.77],
         [2.20, 2.42, -0.19], [0.91, 1.94, 6.21], [0.65, 1.93, 4.38],
         [-0.26, 0.82, -0.96], [0.011, 1.03, -0.21], [1.27, 1.28, 0.08],
         [0.13, 3.12, 0.16], [-0.21, 1.23, -0.11], [-2.18, 1.39, -0.19],
         [0.34, 1.96, -0.16], [-1.38, 0.94, 0.45], [-0.12, 0.82, 0.17],
         [-1.44, 2.31, 0.14], [0.26, 1.94, 0.08]]
    y = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1,
         -1, -1]
    return x, y, len(y)


def calError():
    x, y, size = data()
    error = 0
    for i in range(size):
        x1 = x[i][0]
        x2 = x[i][1]
        x3 = x[i][2]
        y0 = y[i]
        out_o1, out_h1 = forward(x1, x2, x3, bias=1)
        error += 0.5 * (out_o1 - y0) * (out_o1 - y0)
    error = error / size
    return error


def train_b():
    initWeight_b()
    err = []
    epoch = []
    for i in range(5000):
        x, y, size = data()
        # for j in range(size):
        j = np.random.randint(0,size -1)
        x1 = x[j][0]
        x2 = x[j][1]
        x3 = x[j][2]
        y0 = y[j]
        out_o1, out_h1 = forward(x1, x2, x3, bias=1)
        # print out_o1
        BPtrain(x1, x2, x3, y0)
        err2 = calError()
        epoch.append(i)
        err.append(err2)
        if err2 < 0.001:
            break
    print "(b)权重固定初始化"
    validate()
    return err, epoch


def train_a():
    initWeight_a()
    err = []
    epoch = []
    for i in range(5000):
        x, y, size = data()
        j = np.random.randint(0, size - 1)
        x1 = x[j][0]
        x2 = x[j][1]
        x3 = x[j][2]
        y0 = y[j]
        # out_o1, out_h1 = forward(x1, x2, x3, bias=1)
        BPtrain(x1, x2, x3, y0)
        err2 = calError()
        epoch.append(i)
        err.append(err2)
        if err2 < 0.001:
            break
    print "(a)权重随机初始化"
    validate()
    return err, epoch


def plot():
    err1, epoch1 = train_a()
    print "权重输入层-隐藏层", wji
    print "权重隐藏层-输出层", wkj
    err2, epoch2 = train_b()
    print "权重输入层-隐藏层", wji
    print "权重隐藏层-输出层", wkj
    plt.plot(epoch1, err1, 'r-', label="2.a")
    plt.plot(epoch2, err2, 'g-', label="2.b")
    plt.legend(loc='upper right')
    plt.grid(True)
    plt.show()


def validate():
    x, y, size = data()
    right = 0
    total = 20
    for i in range(size):
        x1 = x[i][0]
        x2 = x[i][1]
        x3 = x[i][2]
        y0 = y[i]
        out_o1, out_h1 = forward(x1, x2, x3, bias=1)
        # print sign(out_o1)
        if sign(out_o1) == y0:
            right = right + 1
    print "正确率：", Fraction(right, total) * 100, "%"


plot()



