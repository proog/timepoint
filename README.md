# timepoint

Say you have a bunch of tasks with deadlines, but the order isn't important. Still, you would ideally like to do start them at the same time, e.g. while you're at the office anyway.

This is a simple web app that helps with this incredibly specific problem.

With n tasks, the number of combinations is n!. This utility doesn't do anything intelligent (like dynamic programming), it just generates all n! combinations and selects the best ones by a quality heuristic.
