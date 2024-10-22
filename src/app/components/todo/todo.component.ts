import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { FilterType, TodoModel } from '../../models/todo';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})
export class TodoComponent implements OnInit{
  todolist = signal<TodoModel[]>([
    { id: 1, title: 'Buy milk', completed: false },
    { id: 2, title: 'Clean the kitchen', completed: false },
    { id: 3, title: 'Workout', completed: true }
  ]);



  filter = signal<FilterType>('all');

  todoListFiltered = computed(()=> {
    const filter = this.filter();
    const todo = this.todolist();

    switch (filter) {
      case 'all':
        return todo;
      case 'completed':
        return todo.filter((todo) => todo.completed);
      case 'active':
        return todo.filter((todo) =>!todo.completed);
      default:
        return todo;
    }
  })

  newTodo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)]
  })

  constructor(){
    effect(() => {
      localStorage.setItem('todos', JSON.stringify(this.todolist()));
    })
  }
  ngOnInit(){
    const storage = localStorage.getItem('todos');
    if (storage){
      this.todolist.set(JSON.parse(storage));
    }
  }

  drop(event: CdkDragDrop<TodoModel[]>) {//+
    const todos = this.todolist();//+
    moveItemInArray(todos, event.previousIndex, event.currentIndex);//+
  }

  changeFilter(filterString: FilterType) {
    this.filter.set(filterString);
  }

  addTodo(){
    const newTodoTitle = this.newTodo.value.trim();
    if (this.newTodo.valid && newTodoTitle !== '') {
      this.todolist.update((prev_todos) => {
        return[
          ...prev_todos,
          {id: Date.now(), title: newTodoTitle, completed:false}
        ]
      })
      this.newTodo.reset();
    } else {
      this.newTodo.reset();
    }
  }

  toggleTodo(todoId: number){
    this.todolist.update((prev_todos) =>
      prev_todos.map((todo) =>{
        return todo.id === todoId ? {...todo,completed: !todo.completed}: todo
      
    }))
  }

  removeTodo(todoId: number){
    this.todolist.update((prev_todos) => prev_todos.filter((todo) =>
    todo.id!== todoId))
  }

  updateTodoEditingMode(todoId: number){
    this.todolist.update((prev_todos) =>
    prev_todos.map((todo) =>{
      return todo.id === todoId ? {...todo,editing: true}: {...todo, editing:false}
    }))
  }

  saveTitleTodo(todoId: number, event: Event){
    const title = (event.target as HTMLInputElement).value.trim();
    this.todolist.update((prev_todos) =>
    prev_todos.map((todo) =>{
      return todo.id === todoId && title !== '' ? {...todo, title: title, editing: false}: todo
    }))
  }
}
