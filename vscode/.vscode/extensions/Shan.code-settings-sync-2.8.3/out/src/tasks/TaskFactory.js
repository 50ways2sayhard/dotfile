"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TaskFactory {
    static CreateTask(config, context) {
        this.context = context;
        this.config = config;
        return null;
    }
    static GetTask() {
        if (this.task == null) {
            throw new Error("Task Not Start. Create the Task First.");
        }
        return this.task;
    }
}
TaskFactory.task = null;
TaskFactory.context = null;
TaskFactory.config = null;
exports.TaskFactory = TaskFactory;
//# sourceMappingURL=TaskFactory.js.map