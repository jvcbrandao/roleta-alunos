 document.addEventListener('DOMContentLoaded', () => {
            // Elementos DOM
            const wheel = document.getElementById('wheel');
            const spinButton = document.getElementById('spinButton');
            const winnerName = document.getElementById('winnerName');
            const jsonSelect = document.getElementById('jsonSelect');
            const participantsList = document.getElementById('participantsList');
            const soundToggle = document.getElementById('soundToggle');
            
            // Dados dos participantes (serão carregados do JSON)
            let participantes = [];
            let isSpinning = false;
            let rotation = 0;
            
            // JSON dos participantes
            const participantesJson = {
                "1": [
                    "ALICE",
                    "ANA",
                    "ARTHUR",
                    "EDUARDA",
                    "EMANUEL",
                    "EMANUELLY",
                    "EMMANUEL",
                    "JHONATHAN",
                    "JOÃO",
                    "JUAN G.",
                    "JUAN P.",
                    "LUCAS",
                    "PEDRO",
                    "SOPHIA",
                    "SOPHIE"
                ],
                "2": [
                    "ARTHUR G.",
                    "ARTHUR H.",
                    "BRYAN",
                    "GABRIEL A.",
                    "GABRIEL C.",
                    "HEITOR",
                    "ISABELLA",
                    "JHONNY",
                    "MARIA",
                    "PABLO",
                    "SAMUEL",
                    "VÍTOR"
                ]
            };
            
            // Carregar participantes baseado na seleção
            function loadParticipants() {
                const selectedGroup = jsonSelect.value;
                participantes = [...participantesJson[selectedGroup]];
                createWheel();
                updateParticipantsList();
            }
            
            // Criar a roleta visualmente
            function createWheel() {
                wheel.innerHTML = '';
                const segmentAngle = 360 / participantes.length;
                
                participantes.forEach((participant, index) => {
                    const segment = document.createElement('div');
                    segment.className = 'wheel-segment';
                    
                    // Cores alternadas para os segmentos
                    const color = index % 2 === 0 ? 
                        `hsl(${index * 30}, 70%, 40%)` : 
                        `hsl(${index * 30}, 70%, 30%)`;
                    
                    segment.style.cssText = `
                        position: absolute;
                        width: 50%;
                        height: 50%;
                        left: 50%;
                        top: 0;
                        transform-origin: 0% 100%;
                        transform: rotate(${index * segmentAngle}deg) skewY(${-(90 - segmentAngle)}deg);
                        background: ${color};
                        overflow: hidden;
                    `;
                    
                    const text = document.createElement('div');
                    text.textContent = participant;
                    text.style.cssText = `
                        position: absolute;
                        left: -100%;
                        width: 200%;
                        height: 200%;
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                        padding-top: 20px;
                        transform: skewY(${90 - segmentAngle}deg) rotate(${segmentAngle/2}deg);
                        color: white;
                        font-weight: bold;
                        text-align: center;
                        text-shadow: 0 1px 2px rgba(0,0,0,0.7);
                    `;
                    
                    segment.appendChild(text);
                    wheel.appendChild(segment);
                });
            }
            
            // Atualizar lista de participantes
            function updateParticipantsList() {
                participantsList.innerHTML = '';
                participantes.forEach(participant => {
                    const div = document.createElement('div');
                    div.className = 'participant';
                    div.textContent = participant;
                    participantsList.appendChild(div);
                });
            }
            
            // Tocar som da roleta
            function playSpinSound() {
                if (!soundToggle.checked) return;
                
                // Criar contexto de áudio
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // Configurar som
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 4);
                
                gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 4);
                
                // Iniciar e parar som
                oscillator.start();
                setTimeout(() => {
                    oscillator.stop();
                    
                    // Som de parada (clique)
                    const clickSound = audioContext.createOscillator();
                    const clickGain = audioContext.createGain();
                    
                    clickSound.connect(clickGain);
                    clickGain.connect(audioContext.destination);
                    
                    clickSound.type = 'sine';
                    clickSound.frequency.setValueAtTime(800, audioContext.currentTime);
                    clickSound.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
                    
                    clickGain.gain.setValueAtTime(0.3, audioContext.currentTime);
                    clickGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    
                    clickSound.start();
                    clickSound.stop(audioContext.currentTime + 0.3);
                }, 4000);
            }
            
            // Girar a roleta
            function spinWheel() {
                if (isSpinning || participantes.length === 0) return;
                
                isSpinning = true;
                spinButton.disabled = true;
                
                // Escolher um vencedor aleatório
                const winnerIndex = Math.floor(Math.random() * participantes.length);
                const winner = participantes[winnerIndex];
                
                // Calcular rotação (mínimo 5 voltas + posição do vencedor)
                const segmentAngle = 360 / participantes.length;
                const extraRotation = 5 * 360; // 5 voltas completas
                const winnerPosition = 360 - (winnerIndex * segmentAngle); // Posicionar o vencedor no topo
                const totalRotation = rotation + extraRotation + winnerPosition;
                
                // Tocar som da roleta
                playSpinSound();
                
                // Aplicar rotação com animação
                wheel.style.transform = `rotate(${totalRotation}deg)`;
                rotation = totalRotation % 360;
                
                // Atualizar vencedor após a animação
                setTimeout(() => {
                    winnerName.textContent = winner;
                    winnerName.style.color = '#ffd700';
                    
                    // Efeito de confete
                    createConfetti();
                    
                    isSpinning = false;
                    spinButton.disabled = false;
                }, 4000);
            }
            
            // Criar efeito de confete
            function createConfetti() {
                const confettiCount = 150;
                const container = document.querySelector('.container');
                
                for (let i = 0; i < confettiCount; i++) {
                    const confetti = document.createElement('div');
                    confetti.className = 'confetti';
                    confetti.style.cssText = `
                        position: absolute;
                        width: 10px;
                        height: 10px;
                        background: hsl(${Math.random() * 360}, 100%, 50%);
                        top: -20px;
                        left: ${Math.random() * 100}%;
                        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                        opacity: ${Math.random() * 0.5 + 0.5};
                        animation: confetti-fall ${Math.random() * 3 + 2}s linear forwards;
                    `;
                    
                    container.appendChild(confetti);
                    
                    // Remover após animação
                    setTimeout(() => {
                        confetti.remove();
                    }, 5000);
                }
                
                // Adicionar estilos de animação dinamicamente
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes confetti-fall {
                        0% { transform: translateY(0) rotate(0deg); }
                        100% { transform: translateY(100vh) rotate(${Math.random() * 720 - 360}deg); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Event listeners
            spinButton.addEventListener('click', spinWheel);
            jsonSelect.addEventListener('change', loadParticipants);
            
            // Inicializar
            loadParticipants();
        });