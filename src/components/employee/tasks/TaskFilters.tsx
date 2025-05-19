
/**
 * 任务筛选和排序组件
 * 提供任务列表的筛选和排序选项
 */
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

// 定义筛选和排序类型
export type FilterType = "all" | "assigned" | "created" | "incomplete" | "completed";
export type SortType = "priority" | "deadline" | "created";

interface TaskFiltersProps {
  filter: FilterType;                       // 当前选中的筛选条件
  sort: SortType;                           // 当前选中的排序方式
  onFilterChange: (value: FilterType) => void; // 筛选条件改变时的回调
  onSortChange: (value: SortType) => void;  // 排序方式改变时的回调
  canAssignTasks: boolean;                  // 用户是否有权限分配任务
}

/**
 * 任务筛选和排序组件
 * 
 * @param {TaskFiltersProps} props - 组件属性
 * @returns {React.ReactElement} 渲染的筛选和排序UI组件
 */
const TaskFilters: React.FC<TaskFiltersProps> = ({
  filter,
  sort,
  onFilterChange,
  onSortChange,
  canAssignTasks,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* 筛选条件下拉菜单 */}
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
      
      {/* 排序方式下拉菜单 */}
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
