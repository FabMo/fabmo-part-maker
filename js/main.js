
///load bootstrap js 
window.$ = window.jQuery = require('jquery');
require('../bootstrap/js/src/button.js');
require('../bootstrap/js/src/collapse.js');
require('../bootstrap/js/src/dropdown.js');
require('../bootstrap/js/src/modal.js');

//load Fabmo Library
var FabMoDashboard = require('./libs/fabmo.js')
var jobLog = [];
var count = 10;
var pagesCount = 3;
var pageTotal;
var groupNum = 1;
var appconfig = {'groupNum' : groupNum, 'groups':{'group-1':{jobs: [], 'name':'Group One'}}};



// ES6 features work here too

///Create new Fabmo Object 

var colorThemes = [{primary:'#e53935', dark:'#ab000d', light:'#ab000d'}, {primary:'#d81b60', dark:'#a00037', light:'#ff5c8d'}, {primary:'#8e24aa', dark:'#5c007a', light:'#c158dc'},{primary:'#5e35b1', dark:'#280680', light:'#9162e4'}, {primary:'#3949ab', dark:'#00227b', light:'#6f74dd'}, {primary:'#1e88e5', dark:'#005cb2', light:'#6ab7ff'}, {primary:'#039be5', dark:'#006db3', light:'#63ccff'}, {primary:'#00acc1', dark:'#007c91', light:'#5ddef4'}, {primary:'#00897b', dark:'#005b4f', light:'#4ebaaa'}, {primary:'#43a047', dark:'#00701a', light:'#76d275'}, {primary:'#7cb342', dark:'#4b830d', light:'#aee571'}, {primary:'#c0ca33', dark:'#8c9900', light:'#f5fd67'}, {primary:'#fdd835', dark:'#c6a700', light:'#ffff6b'}, {primary:'#ffb300', dark:'#c68400', light:'#ffe54c'}, {primary:'#fb8c00', dark:'#c25e00', light:'#ffbd45'}, {primary:'#f4511e', dark:'#b91400', light:'#ff844c'}, {primary:'#6d4c41', dark:'#40241a', light:'#9c786c'}, {primary:'#757575', dark:'#494949', light:'#a4a4a4'}];
var fabmo = new FabMoDashboard();

$( document ).ready(function(){
  for(var i=0; i<colorThemes.length; i++){
    var id = colorThemes[i].primary.split('#')[1];

    var colorBlock = '<div class="colorBlock" data-primary="'+colorThemes[i].primary+'"  data-dark="'+colorThemes[i].dark+'" data-light="'+colorThemes[i].light+'" id="'+id+'"></div>';
    $('.colors').append(colorBlock);
    $('#'+id).css('background-color', colorThemes[i].primary);
  }


  fabmo.getAppConfig(function(err, config){
    console.log(config);
    if($.isEmptyObject(config)){
      var option = '<option  id="group-1">Group One</option>';
      $('.groups').prepend(option);
    } else {
      appconfig = config
      groupNum = config.groupNum;
      for (var group in appconfig.groups) {
        var name = appconfig.groups[group].name || 'New Name'
        var option = '<option  id="'+group+'">'+name+'</option>'
        $('.groups').prepend(option);
        $('#'+group).data('primary', appconfig.groups[group].primary);
        $('#'+group).data('dark', appconfig.groups[group].dark);
        $('#'+group).data('light', appconfig.groups[group].light);
      }
    }
    $(".groups").val($(".groups option:first").val());
    setColors($('.groups option:selected'));
    var id = $('.groups option:selected').attr('id');
    loadJobs(appconfig.groups[id].jobs);
  });

});

$('.settings').click(function(){
  $(".edit-list").empty()
  $('#myModal').modal('show');
  $('#groupName').val($('.groups option:selected' ).text());
  $('.part-list .parts').each(function(){
    var data = $(this)[0];
    var newLi = '<li class="'+data.className+'" id="'+data.id+'-edit"><span>'+data.textContent+'</span><i class="icon-trash-empty delete"></i></li>'
    $('.edit-list').append(newLi);
  });
});

$('.edit-list').on('click', '.delete', function(){
  var group = $('.groups option:selected').attr('id');
  var el = $(this).parent();
  el.remove();
  var id =el.attr('id').split("-")[0];
  $('#'+id).remove();
  var index = appconfig.groups[group].jobs.findIndex(function(job){
    return job.id == id;
  })
  console.log(index);
  console.log(appconfig.groups[group].jobs);
  appconfig.groups[group].jobs.splice(index, 1);
  console.log(appconfig.groups[group].jobs);
  setConfig(appconfig);


});

$('.themeColor').click(function(e){
  $('.colors').show();
  var posX = $(this).offset().left,
      posY = $(this).offset().top;
  $('.colors').css({'left': posX,'top':posY});
  
})

$('.colors').on('click', '.colorBlock', function(){
  $('.colors').hide();
  var primary = $(this).data('primary'),
      dark = $(this).data('dark'),
      light = $(this).data('light');
      var objId = $('.groups option:selected').attr('id');
      appconfig.groups[objId].primary = primary;
      appconfig.groups[objId].dark = dark;
      appconfig.groups[objId].light = light;
      setConfig(appconfig);
      colorChange(primary, dark, light);
});

$('.close').click(function(){
    $('.colors').hide();
});

$('.groups').on('change', function(){
  if($(this).val() == '+'){
    $('.part-list li').not('.part-list li:last').remove();
    groupNum++;
    var newId = 'group-' + groupNum;
    $('#groupName').val('');
    $('.groups').prepend('<option  id="'+newId+'">New Group</option>');
    $(".groups").val($(".groups option:first").val());
    $('#myModal').modal('show'); 
    appconfig.groupNum = groupNum;   
    appconfig.groups[newId] = {};
    appconfig.groups[newId].jobs =[];
    appconfig.groups[newId].name = "New Group";
    setColors($('.groups option:selected'));
    setConfig(appconfig);
  } else {
    setColors($('.groups option:selected'));
    var id = $('.groups option:selected').attr('id');
    loadJobs(appconfig.groups[id].jobs);
  }

});

$('#groupName').change(function(){

  var name = $('#groupName').val();
  $('.groups option:selected').text(name);
  var id = $('.groups option:selected').attr('id');
  appconfig.groups[id].name = name;
  setConfig(appconfig);
});

$('#delete').click(function(){
  delete appconfig.groups[$('.groups option:selected').attr('id')];
  $('.groups option:selected').remove();
  $('.groups').change();
});

$('#addPart').click(function(){
  console.log('clicked');
  $(".new-part-list, .jobHistory").empty()
  $(".new-part-list").empty();
  $('.jobHistory').append('<li class="page-item" id ="previous"><a class="page-link"  href="#"><span aria-hidden="true">&laquo;</span></a></li><li class="page-item" id="next"><a class="page-link"  href="#"><span aria-hidden="true">&raquo;</span></a></li>');
  $('#jobsModal').modal('show');
    fabmo.getJobHistory({start:0,count:count},function(err, history) {
      var totalCount = history.total_count;
      pageTotal = Math.ceil(totalCount/count);
      var remainder = totalCount - (Math.floor(totalCount/count)*count);
      var firstData = history.data;


      for(var i = 0; i<pageTotal; i++){
        var page = '<li class="page-item" id ="'+i+'"><a class="page-link"  href="#"><span>'+(i+1)+'</span></a></li>';
        $(page).insertBefore('#next');
        jobLog.push([]);
      };

      $('#0').addClass('active');
      $('#previous').addClass('disabled');

      for(var i = 0; i < firstData.length; i++){
        jobLog[0].push(firstData[i]);
      };

      for(var i = 0; i<jobLog[0].length; i++){
        var li = '<li class="list-group-item part parts" id="'+jobLog[0][i]._id+'">'+jobLog[0][i].name+'</li>';
        $('.new-part-list').append(li);
      };

      makeJobsList(0);
    });






});

$('.new-part-list').on('click', 'li', function(){
  var part = $(this)[0];
  var group = $('.groups option:selected').attr('id');
  appconfig.groups[group].jobs.push({'name': part.innerHTML, 'id':part.id});
  setConfig(appconfig);
  $('.part-list').prepend(part);
  $('#jobsModal').modal('hide');
});

$('.jobHistory').on('click', '.page-item', function(){
  var id = $(this).attr('id');
  $('#next').removeClass('disabled');
  $('#previous').removeClass('disabled');
  if (id !== 'previous' && id !== 'next') {
    $('.page-item').removeClass('active');
    $(this).addClass('active');
    $(".new-part-list").empty();
    if (!jobLog[id].length){
      var start = (count * id); 
      fabmo.getJobHistory({start:start,count:count},function(err, history) {
        var data = history.data;
        for(var i = 0; i < data.length; i++){
          jobLog[id].push(data[i]);
        };
        makeJobsList(id);
      });
    } else {
      makeJobsList(id);
    }
    if((parseInt(id) + 1) === pageTotal){
      $('#next').addClass('disabled');
    }
    if((parseInt(id)) === 0){
      $('#previous').addClass('disabled');
    }
  } else if (id ==='next'){
    $(".new-part-list").empty();
    var currentId = $('.active').attr('id');
    $('.page-item').removeClass('active');
    var newId = ((parseInt(currentId) + 1));
    if (!jobLog[newId].length){
      var start = (count * newId); 
      fabmo.getJobHistory({start:start,count:count},function(err, history) {
        var data = history.data;
        for(var i = 0; i < data.length; i++){
          jobLog[newId].push(data[i]);
        };
        makeJobsList(newId);
      });
    } else {
      makeJobsList(newId);
    }
    if ($('#'+newId)){
      $('#'+newId).addClass('active');
      if((newId + 1) === pageTotal){
        $('#next').addClass('disabled');
      }

    }
  } else if (id ==='previous'){
    $(".new-part-list").empty();
    var currentId = $('.active').attr('id');
    $('.page-item').removeClass('active');
    var newId = ((parseInt(currentId) - 1));
    console.log(newId);
    if (!jobLog[newId].length){
      var start = (count * newId); 
      fabmo.getJobHistory({start:start,count:count},function(err, history) {
        var data = history.data;
        for(var i = 0; i < data.length; i++){
          jobLog[newId].push(data[i]);
        };
        makeJobsList(newId);
      });
    } else {
      makeJobsList(newId);
    }
    if ($('#'+newId)){
      $('#'+newId).addClass('active');
      if(newId === 0) {
        $('#previous').addClass('disabled');
      }
    } 
  }
});

$('.part-list').on('click', 'li', function(){
  var jobId = $(this).attr('id');
  if(jobId != 'addPart'){
    fabmo.clearJobQueue(function(err,data){
      if (err){
        cosole.log(err);
      } else {
        fabmo.resubmitJob(jobId, {stayHere : true}, function(err, result) {
          if (err){
            console.info(err);
          } else {
            fabmo.runNext(function(err, data) {
              if (err) {
                console.info(err);
              } else {
                console.info('running');
              }
            });
          }
        });
      }
    });
  }
});

function setColors(el){
  if (el.data('primary')){
        var dark = el.data('dark'),
        light = el.data('light'),
        primary = el.data('primary');
        colorChange(primary, dark, light);
    
  } else {
      var color = colorThemes[Math.floor(Math.random() * (colorThemes.length-1))],
          primary = color.primary,
          dark = color.dark,
          light = color.light;
          el.data('primary', primary);
          el.data('dark', dark);
          el.data('light', light);
          colorChange(primary, dark, light);
  }
  appconfig.groups[el.attr('id')].primary = el.data('primary');
  appconfig.groups[el.attr('id')].light = el.data('light');
  appconfig.groups[el.attr('id')].dark = el.data('dark');
  setConfig(appconfig);
}

function loadJobs(jobs) {
  $('.part-list li').not('.part-list li:last').remove();
  for(var i = 0; i < jobs.length; i++){
    var li = '<li class="list-group-item part parts" id="'+jobs[i].id+'">'+jobs[i].name+'</li>';
    $('.part-list').prepend(li);
  }
}

function setConfig (appconfig) {
  fabmo.setAppConfig(appconfig, function(err,data){
    if(err){
      console.log(err);
    } else {
      console.log(data);
    }
  })
}

function colorChange(primary, dark, light){
  $('.groups, .top').css({'background-color': primary,'border-color':primary});
  $('li').css({'color': dark});
  $('li').css({'border-bottom-color': primary});
  $('.themeColor').css({'background-color': primary});
  $('.jobHistory li a').css({'color': dark});
  var c = $('.themeColor').css('background-color');
  var rgb = c.replace(/^(rgb|rgba)\(/,'').replace(/\)$/,'').replace(/\s/g,'').split(',');
  var o = Math.round(((parseInt(rgb[0]) * 299) + (parseInt(rgb[1]) * 587) + (parseInt(rgb[2]) * 114)) / 1000);
  (o > 125) ? $('.top, .groups').css('color', '#333'): $('.top, .groups').css('color', '#eee');
}

function makeJobsList(id){
  for (var i = 0; i<jobLog[id].length; i++){
    if (jobLog[id][i]) {
      var li = '<li class="list-group-item part parts" id="'+jobLog[id][i]._id+'">'+jobLog[id][i].name+'</li>';
      $('.new-part-list').append(li);
    }
  }
}; 