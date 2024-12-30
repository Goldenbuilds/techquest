        let currentAssessment = null;
        let currentQuestionIndex = 0;
        const assessmentData = {
          personality: {
            questions: [{
              question: "How do you prefer to recharge?",
              options: ["Spending time alone", "Being around others", "A mix of both", "Through physical activity"]
            }, {
              question: "When solving problems, do you tend to:",
              options: ["Follow your intuition", "Analyze data and facts", "Seek others' opinions", "Try different approaches"]
            }, {
              question: "In a team setting, you typically:",
              options: ["Take the lead", "Support others", "Mediate conflicts", "Focus on execution"]
            }],
            progress: 0,
            answers: []
          },
          skills: {
            questions: [{
              question: "Have you ever done any coding or programming?",
              options: ["Never", "Basic HTML/CSS", "Some programming", "Experienced developer"]
            }, {
              question: "How comfortable are you with technology?",
              options: ["Very comfortable", "Somewhat comfortable", "Neutral", "Still learning"]
            }, {
              question: "Which tasks do you enjoy most?",
              options: ["Problem solving", "Design and creativity", "Analysis and data", "Communication and coordination"]
            }],
            progress: 0,
            answers: []
          },
          interests: {
            questions: [{
              question: "Which tech field interests you most?",
              options: ["Web Development", "Data Science", "Cybersecurity", "Product Management"]
            }, {
              question: "What aspect of technology fascinates you?",
              options: ["Creating new things", "Solving complex problems", "Helping others", "Understanding how things work"]
            }, {
              question: "Which emerging technology excites you?",
              options: ["Artificial Intelligence", "Blockchain", "Virtual Reality", "Internet of Things"]
            }],
            progress: 0,
            answers: []
          },
          workStyle: {
            questions: [{
              question: "What's your ideal work environment?",
              options: ["Remote work", "Office setting", "Hybrid model", "Flexible arrangement"]
            }, {
              question: "How do you prefer to work?",
              options: ["Independently", "In a team", "Mix of both", "Project-dependent"]
            }, {
              question: "What's your preferred pace of work?",
              options: ["Fast-paced", "Steady and methodical", "Variable", "Deadline-driven"]
            }],
            progress: 0,
            answers: []
          }
        };
        function startAssessment(type) {
          currentAssessment = type;
          currentQuestionIndex = 0;
          showModal();
          updateQuestion();
        }
        function showModal() {
          const modal = document.getElementById('assessmentModal');
          modal.style.display = 'flex';
          document.getElementById('modalTitle').textContent = `${currentAssessment.charAt(0).toUpperCase() + currentAssessment.slice(1)} Assessment`;
        }
        function hideModal() {
          const modal = document.getElementById('assessmentModal');
          modal.style.display = 'none';
        }
        function updateQuestion() {
          const questions = assessmentData[currentAssessment].questions;
          const question = questions[currentQuestionIndex];
          document.getElementById('questionText').textContent = question.question;
          const optionsContainer = document.getElementById('optionsContainer');
          optionsContainer.innerHTML = '';
          question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            if (assessmentData[currentAssessment].answers[currentQuestionIndex] === index) {
              button.classList.add('selected');
            }
            button.textContent = option;
            button.onclick = () => selectOption(index);
            optionsContainer.appendChild(button);
          });
          document.getElementById('nextBtn').disabled = assessmentData[currentAssessment].answers[currentQuestionIndex] === undefined;
          updateNavigationButtons();
        }
        function selectOption(optionIndex) {
          const options = document.querySelectorAll('.option-btn');
          options.forEach(opt => opt.classList.remove('selected'));
          options[optionIndex].classList.add('selected');
          assessmentData[currentAssessment].answers[currentQuestionIndex] = optionIndex;
          document.getElementById('nextBtn').disabled = false;
        }
        function updateNavigationButtons() {
          const prevBtn = document.getElementById('prevBtn');
          const nextBtn = document.getElementById('nextBtn');
          prevBtn.style.visibility = currentQuestionIndex > 0 ? 'visible' : 'hidden';
          nextBtn.textContent = currentQuestionIndex === assessmentData[currentAssessment].questions.length - 1 ? 'Finish' : 'Next';
        }
        function previousQuestion() {
          if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            updateQuestion();
          }
        }
        function nextQuestion() {
          const questions = assessmentData[currentAssessment].questions;
          if (assessmentData[currentAssessment].answers[currentQuestionIndex] === undefined) {
            alert("Please select an answer before continuing.");
            return;
          }
          if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            updateQuestion();
          } else {
            const allAnswered = assessmentData[currentAssessment].answers.length === questions.length && !assessmentData[currentAssessment].answers.includes(undefined);
            if (!allAnswered) {
              alert("Please answer all questions before completing the assessment.");
              return;
            }
            completeAssessment();
          }
        }
        async function completeAssessment() {
          const progress = 100;
          assessmentData[currentAssessment].progress = progress;
          document.getElementById(`${currentAssessment}Progress`).style.width = `${progress}%`;
          const steps = document.querySelectorAll('.step-indicator');
          const currentStep = Array.from(steps).find(step => step.classList.contains('active'));
          currentStep.classList.remove('active');
          currentStep.classList.add('completed');
          const nextStep = currentStep.parentElement.nextElementSibling?.querySelector('.step-indicator');
          if (nextStep) {
            nextStep.classList.add('active');
          }
          hideModal();
          const allAssessmentsComplete = Object.keys(assessmentData).every(assessment => assessmentData[assessment].progress === 100);
          if (allAssessmentsComplete) {
            const analysis = await getAIGuidance();
            if (analysis) {
              showResults(analysis);
            }
          } else {
            const assessmentTypes = ['personality', 'skills', 'interests', 'workStyle'];
            const currentIndex = assessmentTypes.indexOf(currentAssessment);
            if (currentIndex < assessmentTypes.length - 1) {
              setTimeout(() => {
                startAssessment(assessmentTypes[currentIndex + 1]);
              }, 500);
            }
          }
        }
        async function getAIGuidance() {
          try {
            const response = await fetch('/api/ai_completion', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                prompt: `Analyze the assessment results and provide career guidance.
                
                <typescript-interface>
                interface GuidanceResponse {
                  careerSuggestions: Array<{
                    title: string;
                    match: number;
                    description: string;
                  }>;
                  strengthsAndWeaknesses: {
                    strengths: string[];
                    areasForImprovement: string[];
                  };
                  nextSteps: {
                    immediate: string[];
                    longTerm: string[];
                  };
                  learningResources: Array<{
                    type: string;
                    name: string;
                    url: string;
                  }>;
                }
                </typescript-interface>
                
                <example>
                {
                  "careerSuggestions": [
                    {
                      "title": "Frontend Developer",
                      "match": 85,
                      "description": "Your creative problem-solving and interest in visual design make this a strong match."
                    }
                  ],
                  "strengthsAndWeaknesses": {
                    "strengths": ["Creative thinking", "Problem solving"],
                    "areasForImprovement": ["Technical skills", "Team collaboration"]
                  },
                  "nextSteps": {
                    "immediate": ["Complete a basic HTML/CSS course"],
                    "longTerm": ["Build a portfolio of projects"]
                  },
                  "learningResources": [
                    {
                      "type": "Course",
                      "name": "Web Development Bootcamp",
                      "url": "https://example.com/course"
                    }
                  ]
                }
                </example>`,
                data: assessmentData
              })
            });
            return await response.json();
          } catch (error) {
            console.error('Error getting AI guidance:', error);
            return null;
          }
        }
        function showGuide() {
          alert("Need help? Our AI guide is here to assist you on your journey to finding the perfect tech career!");
        }
        document.addEventListener('DOMContentLoaded', () => {
          const guide = document.querySelector('.floating-guide');
          guide.style.animation = 'bounce 2s infinite';
        });
        document.getElementById('assessmentModal').addEventListener('click', e => {
          if (e.target === document.getElementById('assessmentModal')) {
            hideModal();
          }
        });
        function showResults(analysis) {
          const modal = document.getElementById('resultsModal');
          modal.style.display = 'flex';
          const suggestionsContainer = document.getElementById('careerSuggestions');
          suggestionsContainer.innerHTML = analysis.careerSuggestions.map(career => `
            <div class="career-match-card">
              <h4>${career.title} <span class="match-score">${career.match}% Match</span></h4>
              <p>${career.description}</p>
            </div>
          `).join('');
          document.getElementById('strengthsList').innerHTML = analysis.strengthsAndWeaknesses.strengths.map(strength => `<li>${strength}</li>`).join('');
          document.getElementById('improvementList').innerHTML = analysis.strengthsAndWeaknesses.areasForImprovement.map(area => `<li>${area}</li>`).join('');
          document.getElementById('immediateSteps').innerHTML = analysis.nextSteps.immediate.map(step => `<li>${step}</li>`).join('');
          document.getElementById('longTermSteps').innerHTML = analysis.nextSteps.longTerm.map(step => `<li>${step}</li>`).join('');
          document.getElementById('learningResources').innerHTML = analysis.learningResources.map(resource => `
            <a href="${resource.url}" class="resource-link" target="_blank">
              ${resource.name} <span class="resource-type">(${resource.type})</span>
            </a>
          `).join('');
        }
        function hideResultsModal() {
          document.getElementById('resultsModal').style.display = 'none';
        }
        function downloadResults() {
          const resultsContainer = document.querySelector('.results-container');
          
          const careerMatches = Array.from(document.querySelectorAll('.career-match-card'))
            .map(card => {
              const title = card.querySelector('h4').textContent;
              const description = card.querySelector('p').textContent;
              return `${title}\n${description}\n`;
            })
            .join('\n');
        
          const strengths = Array.from(document.getElementById('strengthsList').children)
            .map(li => `- ${li.textContent}`)
            .join('\n');
            
          const improvements = Array.from(document.getElementById('improvementList').children)
            .map(li => `- ${li.textContent}`)
            .join('\n');
        
          const immediateSteps = Array.from(document.getElementById('immediateSteps').children)
            .map(li => `- ${li.textContent}`)
            .join('\n');
            
          const longTermSteps = Array.from(document.getElementById('longTermSteps').children)
            .map(li => `- ${li.textContent}`)
            .join('\n');
        
          const resources = Array.from(document.querySelectorAll('.resource-link'))
            .map(link => `- ${link.textContent}`)
            .join('\n');
        
          const reportContent = `
        TechQuest Career Assessment Results
        =================================
        
        CAREER MATCHES
        -------------
        ${careerMatches}
        
        YOUR PROFILE
        -----------
        Strengths:
        ${strengths}
        
        Areas for Growth:
        ${improvements}
        
        NEXT STEPS
        ----------
        Immediate Steps:
        ${immediateSteps}
        
        Long Term Goals:
        ${longTermSteps}
        
        RECOMMENDED RESOURCES
        -------------------
        ${resources}
        `;
        
          const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
          
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'TechQuest-Career-Report.txt';
          
          document.body.appendChild(link);
          link.click();
          
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }, 100);
        }
        document.getElementById('resultsModal').addEventListener('click', e => {
          if (e.target === document.getElementById('resultsModal')) {
            hideResultsModal();
          }
        });
