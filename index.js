let tasks=[]
const STATUS_PENDING=1
const STATUS_INPROGRESS=2
const STATUS_COMPLETED=3
$(()=>{
    tasks=localStorage.getItem("tasks");
    if(tasks==null){
        tasks="[]"
    }
    tasks=JSON.parse(tasks);
    $("#newTask").keyup((e)=>{
        if(e.originalEvent.keyCode==13){
            $("#addTodo").click();
        }
    })
    $("#addTodo").on("click",()=>{
        let task={}
        task.name=$("#newTask").val();
        task.id=new Date().getTime();
        task.status=STATUS_PENDING;
        tasks.unshift(task);
        $("#newTask").val("");
        $("#newTask").focus();
        refreshTasks()
    })
    Mustache.parse(template);
    $("#tasklist").on("click",".material-icons-outlined",(e)=>{
        let currentTarget=e.currentTarget;
        let action=$(currentTarget).text();
        let dataid=$(currentTarget).parent().parent().parent().attr("dataid");
        if(action=="delete"){
            deleteTask(dataid)
        }else if(action=="check_circle"){
            setNextAction(dataid,STATUS_COMPLETED);
        }else if(action=="stop"){
            setNextAction(dataid, STATUS_PENDING);
        }else if(action=="play_arrow" || action == "autorenew"){
            setNextAction(dataid, STATUS_INPROGRESS);
        }
        refreshTasks();
    })
    
    $("#tasklist").on("click", ".col-8, .col-sm-9", function(e) {
        let $nameDiv = $(this);
        
        if ($nameDiv.find('input').length > 0) return;

        let currentName = $nameDiv.text();
        let parentCard = $nameDiv.closest('.card-title');
        let taskId = parentCard.attr('dataid');
        let $input = $("<input type='text' class='edit-task-input' />").val(currentName).css("width","100%");

        $nameDiv.html($input);
        $input.focus();

        $input.on("blur keyup", function(ev) {
            if (ev.type === 'blur' || (ev.type === 'keyup' && ev.keyCode === 13)) {
                let newName = $input.val().trim();
                if (newName !== "") {
                    
                    for(let t of tasks){
                        if (t.id == taskId) t.name=newName;
                    }
                    localStorage.setItem("tasks", JSON.stringify(tasks));
                }
                refreshTasks();
            }
        });
    });

    refreshTasks();
})
let setNextAction = (dataid,nextStatus) => {
    const idx = tasks.findIndex(task => task.id == dataid);
    if (idx > -1) {
        tasks[idx].status = nextStatus;
        const [moved] = tasks.splice(idx, 1);
        tasks.unshift(moved); // move updated task to the front so it renders at the top of its section
    }
}
let deleteTask=(dataid)=>{
    let newTasks=[];
    tasks.forEach((task)=>{
        if(task.id!=dataid){
            newTasks.push(task);
        }
    })
    tasks=[...newTasks];
}
let template=`
<div class='card {{statusclass}}'>
    <div class='card-title' dataid={{taskid}}>
        <div class='row'>
            <div class='col-8 col-sm-9'>{{taskname}}</div>
            <div class='col-1'><span class='material-icons-outlined' title='{{icon1title}}'>{{icon1}}</span></div>
            <div class='col-1'><span class='material-icons-outlined' title='{{icon2title}}'>{{icon2}}</span></div>
            <div class='col-1'><span class='material-icons-outlined' title='{{icon3title}}'>{{icon3}}</span></div>
        </div>
    </div>
</div>
`;
let refreshTasks=()=>{
    $("#tasklist").html("")
    let inprogress=[]
    let pending=[]
    let completed=[]
    tasks.forEach((task)=>{
        switch(task.status){
            case STATUS_PENDING:
                pending.push(task);
                break;
            case STATUS_INPROGRESS:
                inprogress.push(task);
                break;
            case STATUS_COMPLETED:
                completed.push(task);
                break;
        }
    })
    inprogress.forEach((task)=>{
        $("#tasklist").append(getTask(task,STATUS_INPROGRESS));
    })
    if(inprogress.length>0){
        $("#tasklist").append("<hr />");
    }
    pending.forEach((task)=>{
        $("#tasklist").append(getTask(task,STATUS_PENDING));
    })
    if(pending.length>0){
        $("#tasklist").append("<hr />");
    }
    completed.forEach((task)=>{
        $("#tasklist").append(getTask(task,STATUS_COMPLETED));
    })
    localStorage.setItem("tasks",JSON.stringify(tasks));
}
let getTask=(task,status)=>{
    let icon1;
    let icon2;
    let icon3;
    let icon1title;
    let icon2title;
    let icon3title;
    if(status==STATUS_INPROGRESS){
        icon1="check_circle";
        icon1title='Mark Complete';
        icon2="stop";
        icon2title='Mark not started';
        icon3="delete";
        icon3title='Delete'
    }else if(status == STATUS_PENDING){
        icon2="play_arrow";
        icon2title='Mark inprogress';
        icon3="delete";
        icon3title='Delete'
    }else if(status == STATUS_COMPLETED){
        icon2="autorenew";
        icon2title='Mark inprogress';
        icon3="delete"
        icon3title='Delete'
    }
    return Mustache.render(template,{"statusclass":"status"+status,"taskname":task.name,"icon1":icon1,"icon2":icon2,"icon3":icon3, "taskid":task.id,"icon1title":icon1title,"icon2title":icon2title,"icon3title":icon3title});
}

Sortable.create(tasklist, { animation: 500, group: 'list-1', handle: '.card-title', onEnd: function (/**Event*/evt) {
    tasks=[];
    $.each($("#tasklist .card"), function(index,obj){
        var task={}
        task.name=$(obj).find(".col-8").text()
        task.id=$(obj).children(".card-title").attr("dataid");
        task.status=$(obj).hasClass("status1")?1:$(obj).hasClass("status2")?2:3;
        tasks.push(task);
    })
    refreshTasks()
} });
