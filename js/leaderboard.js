var LB_AdminMode = false;
var LB_STORAGE_KEY = "tsp_vrp_leaderboard";

function LB_GetScores(callback) {
    fetch("https://tsp-leaderboard-default-rtdb.firebaseio.com/scores.json")
        .then(response => response.json())
        .then(data => {
            var scores = [];
            if (data) {
                for (var key in data) {
                    scores.push(data[key]);
                }
            }
            callback(scores);
        })
        .catch(err => {
            console.error("Error fetching scores:", err);
            callback([]);
        });
}

function LB_SaveScores(scores, callback) {
    // We replace the entire list of scores to keep it simple and match the old localStorage behavior,
    // though in production you might want to push individual records.
    fetch("https://tsp-leaderboard-default-rtdb.firebaseio.com/scores.json", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scores)
    })
    .then(() => {
        if (callback) callback();
    })
    .catch(err => console.error("Error saving scores:", err));
}

function LB_Submit(name, score) {
    LB_GetScores(function(scores) {
        scores.push({ name: name, score: score, date: new Date().toLocaleDateString() });
        scores.sort(function(a, b) {
            return a.score - b.score;
        });
        LB_SaveScores(scores, function() {
            LB_Render();
        });
    });
}

function LB_Delete(index) {
    if (!LB_AdminMode) return;
    LB_GetScores(function(scores) {
        scores.splice(index, 1);
        LB_SaveScores(scores, function() {
            LB_Render();
        });
    });
}

function LB_Render() {
    LB_GetScores(function(scores) {
        var html =
            '<div class="lb_row header"><span>Rank</span><span>Name</span><span>Score</span><span>Date</span>' +
            (LB_AdminMode ? "<span>Action</span>" : "") +
            "</div>";

        if (scores.length === 0) {
            html +=
                '<div class="lb_row"><span>-</span><span>No scores yet.</span><span>-</span><span>-</span></div>';
        } else {
            for (var i = 0; i < scores.length; i++) {
                var s = scores[i];
                html += '<div class="lb_row">';
                html += "<span>" + (i + 1) + "</span>";
                html += "<span>" + s.name + "</span>";
                html += "<span>" + s.score + "</span>";
                html += "<span>" + s.date + "</span>";
                if (LB_AdminMode) {
                    html +=
                        '<span><button onclick="LB_Delete(' + i + ')">Delete</button></span>';
                }
                html += "</div>";
            }
        }

        document.getElementById("lb_content").innerHTML = html;
    });
}
