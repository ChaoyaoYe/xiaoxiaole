var matchingGame = {};

matchingGame.savingObject = {};

matchingGame.savingObject.deck = [];

matchingGame.savingObject.removedCards = [];

matchingGame.savingObject.currentElapsedTime = 0;

var arr0 = ['cardA10', 'cardA10', 'cardAJ', 'cardAJ', 'cardAQ', 'cardAQ', 'cardAK', 'cardAK', 'cardB10', 'cardB10', 'cardBJ', 'cardBJ', ];

var arr1 = ['cardBQ', 'cardBQ', 'cardBK', 'cardBK', 'cardC10', 'cardC10', 'cardCJ', 'cardCJ', 'cardCQ', 'cardCQ', 'cardCK', 'cardCK', ];

var arr2 = ['cardD10', 'cardD10', 'cardDJ', 'cardDJ', 'cardDQ', 'cardDQ', 'cardDK', 'cardDK', 'cardA10', 'cardA10', 'cardC10', 'cardC10', ];

switch (Math.round(Math.random()*10)){
	case 0:
		matchingGame.deck = arr0;
		break;
	case 1:
		matchingGame.deck = arr1;
		break
	default:
		matchingGame.deck = arr2;
}

$(function() {
	matchingGame.deck.sort(shuffle);

	var savedObject = savedSavingObject();
	if (savedObject != undefined) {
		matchingGame.deck = savedObject.deck;
	}

	matchingGame.savingObject.deck = matchingGame.deck.slice();

	for (var i = 0; i < 11; i++) {
		$(".card:first-child").clone().appendTo("#cards");
	}

	$("#cards").children().each(function(index) {
		$(this).css({
			"left": ($(this).width() + 20) * (index % 4),
			"top": ($(this).height() + 20) * Math.floor(index / 4)
		});

		var pattern = matchingGame.deck.pop();

		$(this).find(".back").addClass(pattern);

		$(this).data("pattern", pattern);

		$(this).attr("data-card-index", index);

		$(this).click(selectCard);
	});

	if (savedObject != undefined) {
		matchingGame.savingObject.removedCards = savedObject.removedCards;
		for (var i in matchingGame.savingObject.removedCards) {
			$(".card[data-card-index=" + matchingGame.savingObject.removedCards[i] + "]").remove();
		}
	}

	matchingGame.elapsedTime = 0;

	if (savedObject != undefined) {
		matchingGame.elapsedTime = savedObject.currentElapsedTime;
		matchingGame.savingObject.currentElapsedTime = savedObject.currentElapsedTime;
	}

	matchingGame.timer = setInterval(countTimer, 1000);

});

function countTimer() {

	matchingGame.elapsedTime++;

	matchingGame.savingObject.currentElapsedTime = matchingGame.elapsedTime;

	var minute = Math.floor(matchingGame.elapsedTime / 60);
	var second = matchingGame.elapsedTime % 60;

	if (minute < 10) minute = "0" + minute;
	if (second < 10) second = "0" + second;

	$("#elapsed-time").html(minute + ":" + second);

	saveSavingObject();
}

function selectCard() {
	if ($(".card-flipped").size() > 1) {
		return;
	}
	$(this).addClass("card-flipped");

	if ($(".card-flipped").size() == 2) {
		setTimeout(checkPattern, 700);
	}
}

function shuffle() {
	return 0.5 - Math.random();
}

function checkPattern() {
	if (isMatchPattern()) {
		$(".card-flipped").removeClass("card-flipped").addClass("card-removed");

		$(".card-removed").bind("webkitTransitionEnd", removeTookCards);
	} else {
		$(".card-flipped").removeClass("card-flipped");
	}
}

function removeTookCards() {
	$(".card-removed").each(function() {
		matchingGame.savingObject.removedCards.push($(this).data("cardIndex"));
		$(this).remove();
	});

	if ($(".card").length == 0) {
		gameover();
	}

}

function isMatchPattern() {
	var cards = $(".card-flipped");
	var pattern = $(cards[0]).data("pattern");
	var anotherPattern = $(cards[1]).data("pattern");
	return (pattern == anotherPattern);
}

function gameover() {
	clearInterval(matchingGame.timer);
	$(".score").html($("#elapsed-time").html());
	var lastScore = localStorage.getItem("last-score");
	lastScoreObj = JSON.parse(lastScore);
	if (lastScoreObj == null) {
		lastScoreObj = {
			"savedTime": "no record",
			"score": 0
		};
	}
	var lastElapsedTime = lastScoreObj.score;
	if (lastElapsedTime == 0 || matchingGame.elapsedTime < lastElapsedTime) {
		$(".ribbon").removeClass("hide");
	}

	var minute = Math.floor(lastElapsedTime / 60);
	var second = lastElapsedTime % 60;

	if (minute < 10) minute = "0" + minute;
	if (second < 10) second = "0" + second;

	$(".last-score").html(minute + ":" + second);

	var savedTime = lastScoreObj.savedTime;

	var currentTime = new Date();
	var month = currentTime.getMonth() + 1;
	var day = currentTime.getDate();
	var year = currentTime.getFullYear();
	var hours = currentTime.getHours();
	var minutes = currentTime.getMinutes();
	if (minutes < 10) minutes = "0" + minutes;
	var seconds = currentTime.getSeconds();
	if (seconds < 10) seconds = "0" + seconds;

	var now = day + "/" + month + "/" + year + " " + hours + ":" + minutes + ":" + seconds;

	var obj = {
		"savedTime": now,
		"score": matchingGame.elapsedTime
	};

	localStorage.setItem("last-score", JSON.stringify(obj));
	$("#popup").removeClass("hide");
	localStorage.removeItem("savingObject");
}

function saveSavingObject() {
	localStorage["savingObject"] = JSON.stringify(matchingGame.savingObject);
}

function savedSavingObject() {
	var savingObject = localStorage["savingObject"];
	if (savingObject != undefined) {
		savingObject = JSON.parse(savingObject);
	}
	return savingObject;
}