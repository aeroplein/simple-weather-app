document.addEventListener('DOMContentLoaded', () => {
    let state = JSON.parse(localStorage.getItem("codeYourTree_data")) || {
        streak: 1,
        xp: 100,
        maxDepth: 3,
        lastLogDate: null
    };


    const UI = {
        logButton: document.getElementById('logBtn'),
        streakText: document.getElementById('streak-count'),
        canvas: document.getElementById('treeCanvas'),
        heatmap: document.getElementById('heatmap'),
        rankText: document.getElementById('tree-rank')
    };

    async function fetchTreeData(username) {
        try {
            const response = await fetch(`http://localhost:8081/api/trees/${username}`);
            if (response.ok) {
                const data = await response.json();
                state = data;
                UI.streakText.innerText = state.streak;
                updateRank();
                drawHeatmap();
                drawTree();
            }
        } catch (error) {
            console.error("Data could not be retrieved. ", error);
        }
    }

    fetchTreeData("testUser");

    async function handleWaterTree(username) {
        const response = await fetch(`http://localhost:8081/api/trees/water/${username}`,
            { method: 'POST' }
        );
        if (response.ok) {
            const data = await response.json();
            state = data;
            alert(`Tree watered! New streak: ${data.streak} days, XP: ${data.xp}`);
            UI.streakText.innerText = data.streak;
            updateRank();
            drawHeatmap();
            drawTree();
        } else {
            const originalText = UI.logButton.innerText;
            UI.logButton.innerText = "Tree is already watered today!";
            setTimeout(() => {
                UI.logButton.innerText = originalText
            }, 2500
            );
        }
    }


    function updateRank() {
        let rankName = "Seedling";
        if (state.streak >= 7) {
            rankName = "Sapling";
        }
        if (state.streak >= 15) {
            rankName = "Young Tree";
        }
        if (state.streak >= 30) {
            rankName = "Mighty Oak";
        }

        if (UI.rankText) {
            UI.rankText.innerText = rankName;
        }
    }

    const context = UI.canvas.getContext('2d');

    function resizeCanvas() {
        UI.canvas.width = UI.canvas.parentElement.clientWidth - 48;
        UI.canvas.height = 300;
    }

    function drawBranch(startX, startY, length, angle, depth) {
        context.beginPath();
        context.save();
        context.shadowBlur = 8;
        context.shadowColor = '#90AB8B';
        context.shadowStyle = '#90AB8B';
        context.lineCap = "round";
        context.lineWidth = Math.max(1, (state.maxDepth - depth + 1) * 1.5);

        context.translate(startX, startY);
        context.rotate(angle * Math.PI / 180);

        context.moveTo(0, 0);
        context.lineTo(0, -length);
        context.stroke();

        if (depth < state.maxDepth) {
            drawBranch(0, -length, length * 0.75, -25, depth + 1);
            drawBranch(0, -length, length * 0.75, 25, depth + 1);
        } else {
            context.beginPath();
            context.shadowBlur = 12;
            context.shadowColor = '#EBF4DD';
            context.fillStyle = '#EBF4DD';
            context.arc(0, -length, 3, 0, Math.PI * 2);
            context.fill();
        }
        context.restore();
    }



    function drawTree() {
        context.clearRect(0, 0, UI.canvas.width, UI.canvas.height);
        const startX = UI.canvas.width / 2;
        const startY = UI.canvas.height - 20;
        drawBranch(startX, startY, 60, 0, 1)
    }

    function drawHeatmap() {
        UI.heatmap.innerHTML = "";
        for (let i = 0; i < 35; i++) {
            const box = document.createElement("div");
            box.classList.add('contribution-box');
            if (i < state.streak) {
                box.classList.add("active");
            }

            UI.heatmap.appendChild(box);
        }
    }

    UI.logButton.addEventListener('click', function () {
        handleWaterTree("testUser");
    });

    UI.streakText.innerText = state.streak;
    updateRank();
    resizeCanvas();
    drawHeatmap();
    drawTree();
    window.addEventListener('resize', () => {
        resizeCanvas();
        drawTree();
    });
});
