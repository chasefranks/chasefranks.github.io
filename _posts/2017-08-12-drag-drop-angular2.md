---
layout: post
title:  "Basic Drag and Drop in Angular2"
date:   2017-08-12
categories: angular
intro: >
  In this post, we demo how to perform basic drag and drop in an Angular 2 application using
  the [ng2-dragula](https://github.com/valor-software/ng2-dragula) module.
published: true
---
{{page.intro}}

## Setting Up the App

Let's bootstrap a basic Angular application using the `ng` cli tool. If you don't have it installed yet, install it with

```
npm install @angular/cli
```

then create a new project with

```
ng new drag-drop-demo
```

We'll get into the project structure in a moment, but a quick glance shows that the `ng new` command creates the usual npm artifacts, namely a package.json and `node_modules/` folder. We can use npm to install Bootstrap and the `ng2-dragula` module for Angular2. `cd` into the project directory and run

```
npm install ng2-dragula bootstrap@4.0.0-beta --save
```

To make the dragula module available to our app, we need to add it to the imports array of our main module. Open the file src/app/app.module.ts, import the `DragulaModule` type

```ts
import { DragulaModule } from 'ng2-dragula'
```

then add it to imports array

```ts
@NgModule({
  declarations: [
    AppComponent,
    TodoComponent
  ],
  imports: [
    BrowserModule,
    DragulaModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

To make use of Bootstrap styling, open the .angular-cli.json file and add location of the minified bootstrap css file to the global styles array:

```json
...
"styles": [
  "styles.css",
  "../node_modules/bootstrap/dist/css/bootstrap.min.css"
],
...
```

Now run `ng serve` from the command line to bring up the development web server, and navigate to [http://localhost:4200](http://localhost:4200) in your browser. If your site comes up, you're ready for the next step.

## Angular2 Components

Let's create a simple todo list component. It will have three columns: todo, in-progress, and done, with items that we can drag and drop into the columns:

Create the component with

```
ng generate component Todo
```

The output should tell you what just happened...

```console
installing component
  create src/app/todo/todo.component.css
  create src/app/todo/todo.component.html
  create src/app/todo/todo.component.spec.ts
  create src/app/todo/todo.component.ts
  update src/app/app.module.ts
```

A git repository was created and the initial skeleton was committed by the `ng new` command to create our project. We can use git to show us exactly what changed:

```
git status

On branch master
Your branch is up-to-date with 'origin/master'.
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   src/app/app.module.ts

Untracked files:
  (use "git add <file>..." to include in what will be committed)

        src/app/todo/

```

We can see the component is entirely contained in the src/app/todo folder which now has these files:

```
src/app/todo/
├── todo.component.css
├── todo.component.html
├── todo.component.spec.ts
└── todo.component.ts
```

and `git diff src/app/app.module.ts` should show

```diff
+import { TodoComponent } from './todo/todo.component'

@NgModule({
   declarations: [
     AppComponent,
+    TodoComponent
...
```

The declarations array consists of all of the components this module will use.

Components in Angular2 consist of two parts:

* **View** - a template written in html with special Angular markup to bind the data from the model into the view
* **Model** - holds the data for our app and methods to alter the data

Angular2 compiles the template 'against' the model to render a view in the browser:

![todo model view](/images/todo-model-view.png)

In Angular, the model is implemented as a Typescript class with instance members to hold the data for the view, and methods to retrieve or alter the data. An Angular component can be any plain Typescript class. The *glue* that binds a class to a view template is the `@Component` decorator at the top of the todo.component.ts file

```typescript
@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
```

The `selector: 'app-todo'` means that we can insert our component anywhere we like into the app with the tag

```html
<app-todo></app-todo>
```

## The Todo View

Let's open the todo.component.html file in an editor. To start with, let's give it three `div`s to hold each column. Don't worry about styling, we'll add that in the css file:

```html
<div class="todo-col" id="todo">
  <!-- add todos here -->
</div>
<div class="todo-col" id="in-progress">
  <!-- add todos here -->
</div>
<div class="todo-col" id="done">
  <!-- add todos here -->
</div>
```

So we can have something to see, let's hardcode a few mock todos each in its own `div`. Let's add some headers to the columns as well:

```html
<div class="todo-col" id="todo">
  <h2>Todo</h2>
  <!-- add todos here -->
  <div class="todo">
    mow the lawn
  </div>
  <div class="todo">
    wash dishes
  </div>
  <div class="todo">
    return book
  </div>
</div>
<div class="todo-col" id="in-progress">
  <h2>In-Progress</h2>
  <!-- add todos here -->
</div>
<div class="todo-col" id="done">
  <h2>Done</h2>
  <!-- add todos here -->
</div>
```

To render the view, add the line `<app-todo></app-todo>` to the app.component.html file. You should see the list display in your browser since the `ng serve` launches a server that automatically triggers the browser to refresh as you make code changes.

Now we can add a little styling. Open the todo.component.css file and add

```css
.todo-col {
  width: 30%;
  background-color: grey;
  padding: 10px;
  float: left;
  margin-left: 10px;
  border-radius: 8px;
  min-height: 200px;
}

.todo {
  color: white;
  padding: 5px;
  margin-top: 10px;
  border-radius: 4px;
  background-color: black;
}
```

It should look something like this when you're done

![todo app 1](/images/todo-1.png)

### Making Our Items Draggable with ng2-dragula

This is really easy. All we do is add `[dragula]` attribute to each div:

```html
<div class="todo-col" id="todo" [dragula]='"todo-bag"'>
  <h2>Todo</h2>
  <!-- add todos here -->
  <div class="todo">
    mow the lawn
  </div>
  <div class="todo">
    wash dishes
  </div>
  <div class="todo">
    return book
  </div>
</div>
<div class="todo-col" id="in-progress" [dragula]='"todo-bag"'>
  <h2>In-Progress</h2>
  <!-- add todos here -->
</div>
<div class="todo-col" id="done" [dragula]='"todo-bag"'>
  <h2>Done</h2>
  <!-- add todos here -->
</div>
```

The value of the attribute, in this case I chose `todo-bag`, groups the `<div>`s together so that children can only be dragged and dropped amongst members of the group (dragula calls them 'bags'). You should be able to drag and drop list item elements with this simple change, as well as reorder them within a column.

## The Todo Model

Let's get the list of items out of the html and into our data model by adding a simple array of strings to hold our list items. Open the todo.component.ts file and add

```ts
 todos: string[] = [
   'mow the lawn',
   'wash dishes',
   'return book'
 ]
```

Delete the hard coded items from inside of the todo `<div>`, and replace them with

{% raw %}
```html
<div class="todo" *ngFor="let todo of todos">{{todo}}</div>
```
{% endraw %}

The view template should look like

{% raw %}
```html
<div class="todo-col" id="todo" [dragula]='"todo-bag"'>
  <h2>Todo</h2>
  <!-- add todos here -->
  <div class="todo" *ngFor="let todo of todos">{{todo.title}}</div>
</div>
<div class="todo-col" id="in-progress" [dragula]='"todo-bag"'>
  <h2>In-Progress</h2>
  <!-- add todos here -->
</div>
<div class="todo-col" id="done" [dragula]='"todo-bag"'>
  <h2>Done</h2>
  <!-- add todos here -->
</div>
```
{% endraw %}

at this point. Even though it appears we've just shifted the hard coded values to the TodoComponent, we now have the abilty to retrieve the list from a web service using an AJAX request. This would be handled for example, by an Angular service which would make a call like

```
GET /todos?userId=user123

Host: todo.example.com:8080
```

to get the the list of todos for a user with id user123.

The `*ngFor="let todo of todos"` is an Angular2 directive that repeats the element it tags for every item of an array defined in the bound model, in this case the `todos` array. We obtain a reference to the current item with the clause `let todo`, and we can refer to its value with the double brackets syntax.

Now a Todo item is not just a string like 'mow the lawn'. In our app, it has a state right? It can be in the 'todo' state, 'in-progress', or 'done'. You can probably think of a lot of other properties a todo item could have, but let's keep it simple for this demo. The minute you have something with more than one simple property, you have a Javascript object so let's define a class to model a Todo item. Create a file in the todo folder named `todo.ts` and give it the following content

```ts
export class Todo {
  id: string
  title: string
  state: string

  constructor( id: string, title: string, state: string ) {
    this.id = id;
    this.title = title
    this.state = state || "todo"
  }
}
```

Note, we've also given our Todo objects an id which will be important later on. Import it into the TodoComponent by adding the line

```ts
import { Todo } from './todo';
```

and change the todos array to

```ts
todos: Todo[] = [
  new Todo('1', 'mow the lawn', 'todo'),
  new Todo('2', 'wash dishes', 'todo'),
  new Todo('3', 'return book', 'in-progress')
]
```

Since each todo item is now a complex object, we need to change the reference in our view from `{{todo}}` to what we really want, which is `{{todo.title}}`:

{% raw %}
```html
<div class="todo" *ngFor="let todo of todos">{{todo.title}}</div>
```
{% endraw %}

There are two more things to clear up:

* How do we get the todo items in the right columns?
* When we drop a todo item into a different column, how do we update the `Todo.state` property?

Let's tackle the first issue, and then discuss how to update the state on drag and drop in the next section. Add the following method to the TodoComponent

```ts
getTodosInTodo(): Todo[] {
  return this.todos.filter(todo => todo.state === 'todo')
}
```

This method simply filters the list of todos to only those where the state is equal to `todo`. Now in the `*ngFor` directive, instead of iterating over the entire `todos` array from the model, we can call this method instead:

```html
<div class="todo" *ngFor="let todo of getTodosInTodo()">{{todo.title}}</div>
```

Similarly, add methods to filter on the other states

```ts
getTodosInProgress(): Todo[] {
  return this.todos.filter(todo => todo.state === 'in-progress')
}

getTodosInDone(): Todo[] {
  return this.todos.filter(todo => todo.state === 'done')
}
```

and populate the in-progress and done columns in the template, which should now look like

{% raw %}
```html
<div class="todo-col" id="todo" [dragula]='"todo-bag"'>
  <h2>Todo</h2>
  <!-- add todos here -->
  <div class="todo" *ngFor="let todo of getTodosInTodo()">{{todo.title}}</div>
</div>
<div class="todo-col" id="in-progress" [dragula]='"todo-bag"'>
  <h2>In-Progress</h2>
  <!-- add todos here -->
  <div class="todo" *ngFor="let todo of getTodosInProgress()">{{todo.title}}</div>
</div>
<div class="todo-col" id="done" [dragula]='"todo-bag"'>
  <h2>Done</h2>
  <!-- add todos here -->
  <div class="todo" *ngFor="let todo of getTodosInDone()">{{todo.title}}</div>
</div>
```
{% endraw %}

Try changing the state field in the todos array of `TodoComponent`, and you should see the items appear in the right columns. For example,

```ts
todos: Todo[] = [
  new Todo('1', 'mow the lawn', 'todo'),
  new Todo('2', 'wash dishes', 'todo'),
  new Todo('3', 'return book', 'in-progress'),
  new Todo('4', 'get dry cleaning', 'done'),
  new Todo('5', 'call Mom', 'done')
]
```

should show

![todo app 2](/images/todo-2.png)

## Responding To Drop Events

When we drop an item into a new column, we want to update its state property to reflect the new state. The browser emits several events during the course of a drag and drop. For our purposes they are:

* `drag` - you've selected a list item and are in the course of dragging it to a column.
* `drop` - you've let go of the list item while holding it over the destination column.

These events can be subscribed to, and a callback function can be fired to handle the event. This is provided by pure [HTML](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) and the DOM event model, and is not specific to Angular.

Dragula provides an Angular service for subscribing to the drag, drop events with a callback. We'll start by injecting the service into our TodoComponent. Open the todo.component.ts file and change the constructor to

```ts
constructor( dragulaService: DragulaService ) { }
```

Add the `DragulaService` type to the list of imports

```
import { DragulaService } from 'ng2-dragula'
```

Simply referencing the DragulaService in the constructor of our `TodoComponent` is enough. Angular will construct a single instance of the `DragulaService`, and *inject* it into the `TodoComponent` at time of creation. For this to work, we need to add `DragulaService` to the list of providers for our main module. Open the app.module.ts file and add it to the list of providers in the `@NgModule` decorator

```ts
providers: [
  DragulaService
],
```

Don't forget to add the import statement as well.

Now we can use the `dragulaService` to subscribe to the drop event. First let's just log it to the console. Change our constructor to look like:

```ts
constructor( dragulaService: DragulaService ) {
  dragulaService.drop.subscribe((value) => {
    console.log(value)
  })
}
```

Now grab one of the list items and drop it to a new column. For example, if I move 'return book' into the done column, the console in Chrome shows me

![](/images/todo-3.png)

We get an array, where the first item is the bag name. The destination column in this case is the third item in the array at index 2, so we can access that to change the state.

How do we know which Todo from our data model to change? Ideally, we would reference the id of the Todo which should be unique. The second item in the event array is actually the div containing the list item we just dropped, so let's go back to our view template and set the 'id' attribute of each div containing a todo to the id of the todo:

{% raw %}
```html
<div class="todo" *ngFor="let todo of getTodosInTodo()" id="{{todo.id}}">{{todo.title}}</div>
```
{% endraw %}

Do the same for the other columns. Now `value[1].id` will have the id of the Todo we just moved, and `value[2].id` will be its new state. Let's create a method in our TodoComponent to update the state

```ts
updateState(todoId: string, newState: string) {
  this.todos.find(todo => todo.id == todoId)
    .state = newState

    // could use web service to persist the state
    console.log('updating web service with new state: todoService.save(this.todos)')
}
```

And change the constructor to call our new method

```ts
constructor( dragulaService: DragulaService ) {
  dragulaService.drop.subscribe((value) => {
    this.updateState(value[1].id, value[2].id)
  })
}
```

Inside of our updateState method, we could actually save the new state using a web service call if we wanted to.

## Conclusion

Hopefully you see how to get drag and drop working in your own Angular app with `ng2-dragula`. As always, any comments, questions, or feedback is appreciated.
