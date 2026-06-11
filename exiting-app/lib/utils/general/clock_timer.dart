import 'dart:async';
import 'dart:ui';

class ClockTimer {
  late Timer _timer;
  int count = 0;
  int secondSteps = 1;
  bool eventInStart;
  VoidCallback onActionTip;

  ClockTimer(this.secondSteps, this.eventInStart, this.onActionTip);

  int getCount() {
    return count;
  }

  start() {
    count = 0;
    Duration oneSec = Duration(seconds: secondSteps);

    if (eventInStart) {
      onActionTip();
    }
    _timer = Timer.periodic(oneSec, (Timer timer) {
      count++;

      onActionTip();
    });
  }

  stop() {
    _timer.cancel();
  }
}
