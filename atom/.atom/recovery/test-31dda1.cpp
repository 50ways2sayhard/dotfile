#include <iostream>

using namespace std;

void count_age(int age, int i) {
  if (i == 7) {
    cout << age << endl;
    return;
  }
  count_age(age + 3, ++i);
}
