angular.module("timepoint", ["ui.bootstrap.datetimepicker"])
    .controller("mainController", function($scope) {
        $scope.tasks = [];
        $scope.deadlines = [];
        $scope.schedules = [];
        $scope.preferredStart = moment().startOf("day").hours(8).toDate();
        $scope.preferredEnd = moment().startOf("day").hours(16).toDate();

        $scope.addTaskAndDeadline = function() {
            $scope.addTask();
            $scope.addDeadline();
        };

        $scope.removeTaskAndDeadline = function() {
            $scope.tasks.pop();
            $scope.deadlines.pop();
        };

        $scope.addTask = function() {
            $scope.tasks.push({
                name: "Task",
                duration: 0
            });
        };

        $scope.addDeadline = function() {
            $scope.deadlines.push({
                time: moment().startOf("day").add(12, "hours").toDate()
            });
        };

        $scope.calculate = function() {
            if($scope.tasks.length != $scope.deadlines.length) {
                alert("number of tasks and number of deadlines are not the same!");
                return;
            }

            var taskCombinations = permute($scope.tasks);

            // zip different task orderings with deadlines
            $scope.schedules = taskCombinations.map(function(combination) {
                var items = combination.map(function(task, index) {
                    var deadline = $scope.deadlines[index];
                    var endTime = moment(deadline.time);
                    var duration = moment.duration(task.duration, "hours");
                    var startTime = moment(endTime).subtract(duration);

                    return {
                        task: task,
                        deadline: deadline,
                        startTime: startTime,
                        endTime: endTime
                    };
                }).sort(function(a, b) {
                    // sort items by earliest start time
                    if(a.startTime.isBefore(b.startTime))
                        return -1;
                    else if(a.startTime.isAfter(b.startTime))
                        return 1;
                    return 0;
                });

                return {
                    items: items,
                    quality: quality(items)
                };
            }).sort(function(a, b) {
                if(a.quality > b.quality)
                    return -1;
                else if(a.quality < b.quality)
                    return 1;
                return 0;
            });
        };

        function quality(schedule) {
            if(!schedule.length)
                return 0;

            var distance = 0;
            var ps = moment($scope.preferredStart);
            var pe = moment($scope.preferredEnd);
            var datesOutsidePreferredTime = [];

            schedule.forEach(function(item) {
                var dist = 0;
                var startTime = item.startTime;

                // set preferred times to the same date as startTime but with different time of day so we only compare time of day
                var preferredStartAdjusted = moment(startTime).hours(ps.hours()).minutes(ps.minutes());
                var preferredEndAdjusted = moment(startTime).hours(pe.hours()).minutes(pe.minutes());

                // if start time is between desired start and end, the distance is zero
                if(startTime.isBefore(preferredStartAdjusted)) {
                    dist = Math.abs(startTime.unix() - preferredStartAdjusted.unix());
                    datesOutsidePreferredTime.push(startTime);
                }
                else if(startTime.isAfter(preferredEndAdjusted)) {
                    dist = Math.abs(startTime.unix() - preferredEndAdjusted.unix());
                    datesOutsidePreferredTime.push(startTime);
                }

                distance += dist;
            });

            distance /= schedule.length;

            var simultaneousDatesCount = 0;
            datesOutsidePreferredTime.forEach(function(a) {
                datesOutsidePreferredTime.forEach(function(b) {
                    if(a !== b && a.isSame(b, "minutes")) {
                        simultaneousDatesCount++;
                    }
                });
            });

            if(simultaneousDatesCount > 0) {
                distance /= simultaneousDatesCount;
            }

            return -distance;
        }

        function permute(arr) {
            var results = [];

            function permuteInner(arr, acc) {
                if(arr.length === 0) {
                    results.push(acc);
                    return;
                }

                for(var i = 0; i < arr.length; i++) {
                    var newArr = arr.slice();
                    var item = newArr.splice(i, 1)[0];
                    permuteInner(newArr, acc.concat([item]));
                }
            }

            permuteInner(arr, []);
            return results;
        }
    });
