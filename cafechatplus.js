// chat info

var memberList = [];

const role = {
    manager: "마피",
    subManager: {id: "qmfkejtm2004", nick: "레이"},
    bot: "시에스"
};

var $ = window.jQuery;

$("head")
.append('<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">');

// var socket = new WebSocket("wss://talkwss.cafe.naver.com");

function getMemeberInfo(userid) {
    if (memberList.length > 0) {
        memberList.forEach(v => {
            if (v.memberId == userid) {
                return v;
            }
        });
        return null;
    } else {
        return null;
    }
}

function getMemberList(callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        memberList = JSON.parse(xhr.responseText.trim()).message.result.memberList;
    }
    xhr.open("get", "https://talk.cafe.naver.com/talkapi/v4/channels/661738695697/sync");
    xhr.send();
}

let lastChatSender = "";
let lastChatEle = null;

function hightlight_memberName() {
    let delList = [];
    $("div.talk_info").each(function() {
        var tag_nick = $(this).children("strong");
        var senderId = $(this).closest("li.log_friend").attr('targetid');
        var tag_bubble = $(this).children("div.bubble")
        .css("font-size", "12px");

        if ($(this).find("img").length == 0) {
            if (senderId == lastChatSender) {
                let msgHtml = tag_bubble.html();
                lastChatEle.find("div.bubble").append(msgHtml);
                delList.push($(this).closest("li"));
                return true;
            } else {
                lastChatSender = senderId;
                lastChatEle = $(this).closest("li");
            }
        }
        

        var nick = tag_nick.text();
        if (senderId == role.subManager.id) {
            tag_nick.css("color", "#fc0050").html(`<span>${role.subManager.nick}</span><span style="border:1px solid; border-radius: 4em; margin-left: 4px; font-size: 4px; padding: 1px 5px">부매니저</span>`);
        }else if (nick == role.bot) {
            tag_bubble
            .css("color", "#034036")
            .css("background-color", "#00deb9");
        }else {
            if ($(this).find("img").length == 0) {
                tag_bubble.css("background-color", "#f2f2f2");
            }
            
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
    delList.forEach(v => v.remove());
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
    $(".list_talk > li").css("padding", "4px 0");
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


function convertTags(text) {
    let sharps = text.match(/\#\S*/gi);
    if (!sharps) sharps = [];
    sharps.forEach(v => {
        if (v.length > 1)
            text = text.replace(v, `<tag:"${v.substr(1)}">`);
    });


    let mentions = text.match(/\@\S*/gi); 
    if (!mentions) mentions = [];
    mentions.forEach(v => {
        if (v.length > 1)
            text = text.replace(v, `<mention:"${v.substr(1)}">`);
    });

    return text;
}

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
    // console.log(e.key);
    switch (e.keyCode) {
        case 13:
            textbox.val("aa");
            break;
    }
    // btn_sendmsg.get(0).click();
    textbox.val(convertTags(textbox.val()));
}

btn_sendmsg.click(function() {
    // console.log("aa");
    // textbox.val("aa");
});

textbox.keypress(KeyBoardInputEvent);