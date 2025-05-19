
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FilterType = "all" | "assigned" | "created" | "incomplete" | "completed";
export type SortType = "priority" | "deadline" | "created";

interface TaskFiltersProps {
  filter: FilterType;
  sort: SortType;
  onFilterChange: (value: FilterType) => void;
  onSortChange: (value: SortType) => void;
  canAssignTasks: boolean;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  filter,
  sort,
  onFilterChange,
  onSortChange,
  canAssignTasks,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="w-full sm:w-48">
        <Select
          value={filter}
          onValueChange={(value) => onFilterChange(value as FilterType)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="筛选任务" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>筛选条件</SelectLabel>
              <SelectItem value="all">全部任务</SelectItem>
              <SelectItem value="assigned">我收到的</SelectItem>
              {canAssignTasks && <SelectItem value="created">我发布的</SelectItem>}
              <SelectItem value="incomplete">未完成的</SelectItem>
              <SelectItem value="completed">已完成的</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full sm:w-48">
        <Select
          value={sort}
          onValueChange={(value) => onSortChange(value as SortType)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="排序方式" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>排序方式</SelectLabel>
              <SelectItem value="priority">按优先级</SelectItem>
              <SelectItem value="deadline">按截止日期</SelectItem>
              <SelectItem value="created">按创建时间</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TaskFilters;
