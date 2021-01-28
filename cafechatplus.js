// chat info
// 1분 새로고침
// 맨션
// 태그

var memberList = [];

const role = {
    manager: "마피",
    subManager: "레이",
    bot: "시에스"
};

var $ = window.jQuery;

$("head")
.append('<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">');

var token = "";
var channelNo = 661738695697;
var userId = "jtyoung24";

// var ws = new WebSocket(`wss://talkwss.cafe.naver.com/socket.io/?channelNo=${channelNo}&userId=${userId}&accessToken=${token}`);

// ws.onopen = function(evt) {
//     console.log(evt);
// }

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
let LastChatTime = 0;

function convert_chats(eleList) {
    let delList = [];
    eleList.forEach(function(ele_v) {
        var ele_chat = $(ele_v).find("div.talk_info");
        var ele_nick = $(ele_chat).children("strong"); 
        var senderId = $(ele_v).attr('targetid');
        var nick = ele_nick.text();
        var ele_bubble = ele_chat.children("div.bubble")
        let cht_time = Number($(ele_v).attr("timestamp"));
        if (isNaN(cht_time)) cht_time = new Date().getTime();
        
        

        // section of tag replace
        ele_bubble.children("p.txt").each(function() {
            var text = $(this).text();

            // replace tag
            let tag_color = "rgba(0, 144, 252, 0.5)"
            if (nick == role.bot) tag_color = "rgba(255, 255, 255, 0.3)";
            
            let sharps = text.match(/\#\S*/gi); console.log(sharps);
            if (!sharps) sharps = [];
            sharps.forEach(v => {
                console.log(v);
                if (v.length > 1)
                    var re = new RegExp(v, 'gi');
                    text = text.replace(v, `<tag:"${v.substr(1)}">`);
            });
        });

        // section of merging chat
        if ($(ele_chat).find("img").length == 0) {
            if (senderId == lastChatSender) {
                const msgHtml = ele_bubble.html();
                if (LastChatTime <= cht_time) {
                    lastChatEle.find("div.bubble").append(msgHtml);
                    LastChatTime = cht_time;
                }else {
                    lastChatEle.find("div.bubble").prepend(msgHtml);
                }
                delList.push($(ele_v));
                
                return true;
            } else {
                lastChatSender = senderId;
                lastChatEle = $(ele_v);
            }
        } else {
            lastChatSender = "";
            lastChatEle = null;
        }


        // section of highlight bubble
        ele_bubble
        .css("font-size", "12px")
        .hover(() => {
            // $(ele_chat).children("div.bubble").animate({
            //     boxShadow: "5px 5px 14px rgba(0, 0, 0, 0.16)"
            // });
            $(ele_chat).children("div.bubble").css("box-shadow", "5px 5px 14px rgba(0, 0, 0, 0.16)");
        }, () => {
            $(ele_chat).children("div.bubble").css("box-shadow", "");
        });


        // section of  highlight account
        
        if (nick == role.manager) {
            ele_nick.css("color", "#fc0050").html(`<span>${role.manager}</span><span style="border:1px solid; border-radius: 4em; margin-left: 4px; font-size: 4px; padding: 1px 5px">매니저</span>`);
        }else if (nick == role.subManager) {
            ele_nick.css("color", "#fc0050").html(`<span>${role.subManager}</span><span style="border:1px solid; border-radius: 4em; margin-left: 4px; font-size: 4px; padding: 1px 5px">부매니저</span>`);
        }else if (nick == role.bot) {
            ele_bubble
            .css("color", "#034036")
            .css("background-color", "#00deb9");

            ele_nick.css("color", "#00deb9").html(`<span>[CS] ${role.bot}</span><span style="border:1px solid; border-radius: 4em; margin-left: 4px; font-size: 4px; padding: 1px 5px">봇</span>`);
        }else {
            if ($(ele_chat).find("img").length == 0) {
                ele_bubble.css("background-color", "#f2f2f2");
            }
        }
        
        $(ele_chat).attr("isconverted", "true");
    });
    delList.forEach(v => v.remove());
}


function newChat(callback) {
    var timer_main = setInterval(function() {
        var newChatLen = $("div.talk_info").length;
        let retl = [];
        $("ul.list_talk > li").each((i, v) => {
            var chat = $(v).find("div.talk_info");
            if (!chat.is("[isconverted]")) {
                retl.push(v);
            }
        });
        if (retl.length > 0) callback(retl);
    }, 10);
}

newChat(convert_chats);

// var timer_j = setInterval(function() {
//     $("#thumb_text").appendTo("ul.list_talk");
//     $(".list_talk > li").css("padding", "4px 0");
// }, 10);

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
// $("div.cont_chat").css("scroll-behavior", "smooth");
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
    // textbox.val(convertTags(textbox.val()));
}

btn_sendmsg.click(function() {
    // console.log("aa");
    // textbox.val("aa");
});

textbox.keypress(KeyBoardInputEvent);