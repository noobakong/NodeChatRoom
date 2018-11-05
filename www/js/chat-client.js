$(function() {
    // io-client
    // 连接成功会触发服务器端的connection事件
    var socket = io();
    var ThePerson = ''
    // 点击输入昵称，回车登录
    $('#name').keyup((ev)=> {
      if(ev.which == 13) {
        inputName();
      }
    });
    $('#nameBtn').click(inputName);
    // 登录成功，隐藏登录层
    socket.on('loginSuc', ()=> {
      name = $('#name').val()
      $('.name').hide();
      ThePerson = name
    })
    socket.on('loginError', ()=> {
      alert('用户名已存在，请重新输入！');
      $('#name').val('');
    }); 

    socket.on('sendErr', (obj) => {
      alert('用户已下线或不存在');
      $('#messageTo span').html('所有人')
    }); 

    function inputName() {
      var imgN = Math.floor(Math.random()*4)+1; // 随机分配头像
      if($('#name').val().trim()!=='') {
        socket.emit('login', { 
          name: $('#name').val(),
          img: 'image/user' + imgN + '.jpg'
        });  // 触发登录事件
      }
      return false; 
    }

    // 系统提示消息
    socket.on('system', (user)=> { 
      // 计算当前时间
      var data = new Date().toTimeString().substr(0, 8);
      $('#messages').append(`<p class='system'><span>${data}</span><br /><span>${user.name}  ${user.status}了聊天室<span></p>`);
      // 滚动条总是在最底部
      $('#messages').scrollTop($('#messages')[0].scrollHeight);
    });

    // 监听抖动事件
    socket.on('shake', (user)=> {
      // 时间
      var data = new Date().toTimeString().substr(0, 8);
      $('#messages').append(`<p class='system'><span>${data}</span><br /><span>${user.name}发送了一个窗口抖动</span></p>`);
      shake();
      // 滚动条总是在最底部
      $('#messages').scrollTop($('#messages')[0].scrollHeight);
    });

    // 显示在线人员
    socket.on('disUser', (usersInfo)=> {
      displayUser(usersInfo);

      // 私发或者全体
      $('#users li').click(function (target) {
        const ToPer = $(this).children('span').html()
        if (ToPer === ThePerson) {
          alert('自己给自己说话？？')
          return false
        }
        $('#messageTo span').html(ToPer)
      })
      // 双击切换为所有人
      $('#users li').dblclick(function (target) {
        $('#messageTo span').html('所有人')
      })
    });

    // 发送消息
    $('#sub').click(sendMsg);
    $('#m').keyup((ev)=> {
      if(ev.which == 13) {
        sendMsg();
      }
    });



    // 接收消息
    socket.on('receiveMsg', (obj)=> {  
      // 发送为图片
      if(obj.type == 'img') {
        if (!obj.Privacy) { // 所有人
          $('#messages').append(`
            <li class='${obj.side}'>
              <img src="${obj.img}">
              <div>
                <span>${obj.name}</span>
                <p style="padding: 0;">${obj.msg}</p>
              </div>
            </li>
          `); 
        } else { // 私聊
          if (obj.side == 'right') { // 发送人
            $('#messages').append(`
              <li class='${obj.side}'>
                <img src="${obj.img}">
                <div>
                  <span>${obj.name}</span>
                  <p style="padding: 0;">${obj.msg}</p>
                  <span class="prp">私聊消息发送给${obj.to}</span>
                </div>
              </li>
            `); 
          } else { // 接收人
            $('#messages').append(`
              <li class='${obj.side}'>
                <img src="${obj.img}">
                <div>
                  <span>${obj.name}</span>
                  <p style="padding: 0;">${obj.msg}</p>
                  <span class="prp">${obj.from}向你发送的私聊消息</span>
                </div>
              </li>
            `); 
          }
        }
        $('#messages').scrollTop($('#messages')[0].scrollHeight);
        return;
      }

      // 提取文字中的表情加以渲染
      var msg = obj.msg;
      var content = '';
      while(msg.indexOf('[') > -1) {  // 其实更建议用正则将[]中的内容提取出来
        var start = msg.indexOf('[');
        var end = msg.indexOf(']');

        content += '<span>'+msg.substr(0, start)+'</span>';
        content += '<img src="image/emoji/emoji%20('+msg.substr(start+6, end-start-6)+').png">';
        msg = msg.substr(end+1, msg.length);
      }
      content += '<span>'+msg+'</span>';
      
      if (!obj.Privacy) {
        $('#messages').append(`
          <li class='${obj.side}'>
            <img src="${obj.img}">
            <div>
              <span>${obj.name}</span>
              <p style="color: ${obj.color};">${content}</p>
            </div>
          </li>
        `);
      } else {
        if (obj.side == 'right') { // 发送人
          $('#messages').append(`
          <li class='${obj.side}'>
            <img src="${obj.img}">
            <div>
              <span>${obj.name}</span>
              <p style="color: ${obj.color};">${content}</p>
              <span class="prp">私聊消息发送给"${obj.to}"</span>
            </div>
          </li>
        `);
        } else { // 接收人
          $('#messages').append(`
          <li class='${obj.side}'>
            <img src="${obj.img}">
            <div>
              <span>${obj.name}</span>
              <p style="color: ${obj.color};">${content}</p>
              <span class="prp">"${obj.from}"向你发送的私聊消息</span>
            </div>
          </li>
        `);
        }
      }
      // 滚动条总是在最底部
      $('#messages').scrollTop($('#messages')[0].scrollHeight);
    }); 


    // 发送消息
    var color = '#000000'; // 默认颜色黑色
    function sendMsg() { 
      if($('#m').val() == '') {
        alert('请输入内容！');
        return false;
      }
      var target = $('#messageTo span').html()
      color = $('#color').val(); 
      socket.emit('sendMsg', {
        msg: $('#m').val(),
        color: color,
        type: 'text',
        target,
        id: socket.id
      });
      $('#m').val(''); 
      return false; 
    }

    var timer;
    function shake() {
      $('.main').addClass('shaking');
      clearTimeout(timer);
      timer = setTimeout(()=> {
        $('.main').removeClass('shaking');
      }, 500);
    }

    // 显示在线人员
    function displayUser(users) {
      $('#users').text(''); // 每次都要重新渲染
      if(!users.length) {
        $('.contacts p').show();
      } else {
        $('.contacts p').hide();
      }
      $('#num').text(users.length);
      for(var i = 0; i < users.length; i++) {
        var $html = `<li>
          <img src="${users[i].img}">
          <span>${users[i].name}</span>
        </li>`;
        $('#users').append($html);
      }
    }

    // 清空历史消息
    $('#clear').click(()=> {
      $('#messages').text('');
      socket.emit('disconnect');
    });
 
    // 渲染表情
    init();
    function init() {
      for(var i = 0; i < 141; i++) {
        $('.emoji').append('<li id='+i+'><img src="image/emoji/emoji ('+(i+1)+').png"></li>');
      }
    }

    // 显示表情
    $('#smile').click(()=> {
      $('.selectBox').css('display', "block");
    });
    $('#smile').dblclick((ev)=> { 
      $('.selectBox').css('display', "none");
    });  
    $('#m').click(()=> {
      $('.selectBox').css('display', "none");
    }); 

    // 用户点击发送表情
    $('.emoji li img').click((ev)=> {
        ev = ev || window.event;
        var src = ev.target.src;
        var emoji = src.replace(/\D*/g, '').substr(6, 8);
        var old = $('#m').val();
        $('#m').val(old+'[emoji'+emoji+']');
        $('.selectBox').css('display', "none");
    });

    // 用户发送抖动
    $('.edit #shake').click(function() {
        socket.emit('shake');
    });

    // 用户发送图片
    $('#file').change(function() {
      var file = this.files[0];  // 上传单张图片
      var reader = new FileReader();

      //文件读取出错的时候触发
      reader.onerror = function(){
          console.log('读取文件失败，请重试！'); 
      };
      // 读取成功后
      reader.onload = function() {
        var target = $('#messageTo span').html()
        var src = reader.result;  // 读取结果
        var img = '<img class="sendImg" src="'+src+'">';
        socket.emit('sendMsg', {  // 发送
          msg: img,
          color: color,
          type: 'img',
          target,
          id: socket.id
        }); 
      };

      reader.readAsDataURL(file); // 读取为64位

    });
});