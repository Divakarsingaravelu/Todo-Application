(function(){
  var KEY = "todoList", THEME = "todoTheme";
  var todos = [], filter = "all";

  function load(){
    try{ var d = JSON.parse(localStorage.getItem(KEY)); if(Array.isArray(d)) return d; }catch(e){}
    return [];
  }
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(todos)); }catch(e){} }

  var $ = function(id){ return document.getElementById(id); };
  var list = $("list"), input = $("input"), empty = $("empty");

  $("date").textContent = new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});

  var delSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>';

  function visible(){
    return todos.filter(function(t){
      return filter === "all" || (filter === "done" ? t.done : !t.done);
    });
  }

  function render(){
    list.innerHTML = "";
    var items = visible();
    items.forEach(function(t){ list.appendChild(row(t)); });

    var done = todos.filter(function(t){return t.done;}).length, total = todos.length, active = total - done;
    $("c-all").textContent = total; $("c-active").textContent = active; $("c-done").textContent = done;
    var pct = total ? Math.round(done/total*100) : 0;
    $("pct").textContent = pct + "%";
    $("bar").style.strokeDashoffset = 175.93 * (1 - pct/100);
    $("left").textContent = active === 1 ? "1 task left" : active + " tasks left";
    $("clear").hidden = done === 0;

    if(items.length === 0){
      empty.hidden = false;
      var msg = {
        all:["Nothing planned yet","Type a task above and press Enter."],
        active:["All caught up","No active tasks right now."],
        done:["No completed tasks","Finished tasks will show up here."]
      }[filter];
      empty.innerHTML = "<strong>"+msg[0]+"</strong>"+msg[1];
    } else empty.hidden = true;
  }

  function row(t){
    var li = document.createElement("li");
    li.className = "item" + (t.done ? " done" : "");

    var cb = document.createElement("input");
    cb.type = "checkbox"; cb.className = "check"; cb.checked = t.done;
    cb.setAttribute("aria-label","Mark complete");
    cb.onchange = function(){ t.done = cb.checked; save(); render(); };

    var span = document.createElement("span");
    span.className = "text"; span.textContent = t.text; span.title = "Double-click to edit";
    span.ondblclick = function(){ startEdit(li, span, t); };

    var del = document.createElement("button");
    del.className = "del"; del.innerHTML = delSvg; del.setAttribute("aria-label","Delete task");
    del.onclick = function(){
      li.classList.add("leaving");
      setTimeout(function(){
        todos = todos.filter(function(x){return x.id !== t.id;});
        save(); render();
      }, 180);
    };

    li.append(cb, span, del);
    return li;
  }

  function startEdit(li, span, t){
    var ed = document.createElement("input");
    ed.className = "edit"; ed.value = t.text; ed.maxLength = 200;
    li.replaceChild(ed, span); ed.focus(); ed.select();
    var finished = false;
    function commit(ok){
      if(finished) return; finished = true;
      var v = ed.value.trim();
      if(ok && v) t.text = v;
      save(); render();
    }
    ed.onkeydown = function(e){ if(e.key === "Enter") commit(true); if(e.key === "Escape") commit(false); };
    ed.onblur = function(){ commit(true); };
  }

  function add(){
    var v = input.value.trim();
    if(!v){ input.focus(); input.placeholder = "Enter a task name to add it"; return; }
    todos.unshift({id: Date.now() + Math.random(), text: v, done: false});
    input.value = ""; input.placeholder = "What needs to be done?";
    if(filter === "done") setFilter("all"); else { save(); render(); }
    save();
  }

  function setFilter(f){
    filter = f;
    document.querySelectorAll(".tab").forEach(function(b){
      b.setAttribute("aria-selected", b.dataset.f === f ? "true" : "false");
    });
    render();
  }

  $("add").onclick = add;
  input.onkeydown = function(e){ if(e.key === "Enter") add(); };
  $("tabs").onclick = function(e){ var b = e.target.closest(".tab"); if(b) setFilter(b.dataset.f); };
  $("clear").onclick = function(){ todos = todos.filter(function(t){return !t.done;}); save(); render(); };

  $("theme").onclick = function(){
    var root = document.documentElement;
    var dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try{ localStorage.setItem(THEME, root.dataset.theme); }catch(e){}
  };
  try{ var th = localStorage.getItem(THEME); if(th) document.documentElement.dataset.theme = th; }catch(e){}

  todos = load().map(function(t,i){
    return {id: t.id != null ? t.id : Date.now()+i, text: String(t.text||""), done: !!t.done};
  });
  render();
})();
