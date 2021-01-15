// chat info
var role = {
    manager: "마피",
    subManager: "레이",
    bot: "시에스"
};

var $ = window.jQuery;

$("head")
.append('<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">');

// var socket = new WebSocket("wss://talkwss.cafe.naver.com");


function getMemberList(callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        try {
            callback(JSON.parse(xhr.responseText.trim()));
        } catch(err) {
            callback([]);
        }
    }
    xhr.open("get", "https://talk.cafe.naver.com/talkapi/v4/channels/661738695697/sync");
    xhr.send();
}

function hightlight_memberName() {
    $("div.talk_info").each(function() {
        var tag_nick = $(this).children("strong");
        var tag_bubble = $(this).children(".bubble")
        .css("font-size", "12px");
        var nick = tag_nick.text();
        if (nick == role.subManager) {
            tag_nick.css("color", "blue")
            .text("[부매니저] " + nick);
        }else if (nick == role.bot) {
            tag_bubble
            .css("color", "#034036")
            .css("background-color", "#00deb9");
        }else {
            tag_bubble.css("background-color", "#f2f2f2");
        }

        tag_bubble.children("p.txt").each(function() {
            var text = $(this).text();

            // replace tag
            let tag_color = "rgba(0, 144, 252, 0.5)"
            if (nick == role.bot) tag_color = "rgba(255, 255, 255, 0.3)";
            var replaceTagText = function(ref) {
                if (ref.includes("<tag:\"")) {
                    var targ = ref.split("<tag:\"")[1].split("\">")[0];
                    var tagName = `<tag:\"${targ}\">`;
                    targ = `<span style="background-color: ${tag_color}"><b>#${targ}</b></span> `;
                    var replaced = ref.replace(tagName, targ);
                    return replaceTagText(replaced);
                } else return ref;
            };
            if (text.includes("<tag:\"")) {
                
                let a = replaceTagText(text);
                $(this).html(a);
            }
        });
        
    });
}

function config_chatbubble() {
    
}

function newChat(callback) {
    var chatLen = 0;
    var timer_main = setInterval(function() {
        var newChatLen = $("div.talk_info").length;
        if (chatLen != newChatLen) {
            console.log(newChatLen - chatLen);
            chatLen = newChatLen;
            // callback();
        }
    }, 1000);
}

// newChat();

var timer_j = setInterval(function() {
    hightlight_memberName();
    config_chatbubble();
    $("#thumb_text").appendTo("ul.list_talk");
    $(".list_talk > li").css("padding", "2px 0");
}, 10);

var isWriting = false;

// console.log($.cookie());
    
var btn_sendmsg = $(".btn_attach.btn_send");
var textbox = $("#msgInputArea");

$("ul.list_talk").append(`<li id="thumb_text" class="log_my">
            <div class="inner_talk">
            <div class="talk_info">
            <div class="bubble">
            <p id="text_inner" class="txt"></p>
            </div>
            <div class="etc">
            <div class="more_set">
            <div class="layer_more" style="display: none;">
            <a href="#" class="link">공지로 등록</a></div></div></div></div></div>
            </li>`);
$("#thumb_text").hide();
$("div.cont_chat").css("scroll-behavior", "smooth");
$("a.btn_attach.btn_more").click(() => {$("span.link_form > label").click()});


function KeyBoardInputEvent(e) {
    // if (isWriting) {
    //     $("#text_inner").text(textbox.val());
    //     if (textbox.val() == "") {
    //         // $("#thumb_text").remove();
    //         $("#thumb_text").slideUp();
    //         isWriting = false;
    //     }
    // } else {
    //     if (textbox.val() != "") {
    //         $("#text_inner").text(textbox.val());
    //         $("#thumb_text").slideDown();
            
    //         isWriting = true;
    //     }
        
    // }

    if (e.keyCode == 49) {
        // btn_sendmsg.get(0).click();
    }
    if (e.key == "@" && e.shiftKey) {
        getMemberList(data => {
            console.log(data.message.result.memberList);
        });
    }
}

textbox.keydown(KeyBoardInputEvent);
textbox.keyup(KeyBoardInputEvent);