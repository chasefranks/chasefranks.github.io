---
layout: post
title:  "Welcome To the Twilight Zone - A Guide for New IT Grads"
date:   2017-06-12
categories: ramblings
intro: >
  I've started to wonder if I'm going to publish anything worthwhile on this blog. I can't seem to find time to actually write about Java, Spring, and all the cool things I've been discovering with Docker and Kubernetes lately. Oh, well. Give it time, and I'll get to it.


  I did want this blog to be about more than just tech however, since there's way much more to life than that. I wanted to write about family and work life balance. I also wanted to use this blog as a conduit for some of my thoughts concerning IT management, what it's really like to work in IT, and tips for furthering your skills even when your job works against you. Unfortunately, I find that there are a lot of forces that keep me from actually using my full potential, and I would like to discuss those here in the hopes of giving some 'real world' guidance to anyone who wants to pursue a career in IT.
published: true
---
{{page.intro}}

# Who Am I?

Let me just start by saying a little bit about myself. I have a doctorate in mathematics, specializing in number theory, which I earned in 2011. Before that, I earned master's and bachelor's degrees, both in math. I absolutely loved mathematics, not just proving theorems, but understanding each theorem deeply, preferring proofs that were constructive or produced a certain technique. Here's the important part...I wanted to use that understanding as a tool to be able to make statements about numbers. If you're interested in my actual dissertation, here's a [link](https://repository.asu.edu/items/8879) to it so you can see all the fancy symbols. If not, no worries I won't mention it again and it's only relevant to my current job as a software developer in that it proves I can think abstractly. It also shows that I have a strong bookish and intellectual side that's deeply ingrained in who I am. I have a need to work quietly and independently for periods at a time, following my own voice to understand the world around me.

I really wanted to be a professor in order to keep doing my research. Unable to find academic work after graduating, I entered the job market starting as a contractor for Citi, doing some type of work in Excel. Although I was a little let down by not finding a job, I was also let down while a graduate student. I found that abstractness was justified as an end in itself. The beauty of number theory to me was that you could make statements about numbers which little children could understand. I now have a strong belief that you are not being honest with yourself in math if you can't take what you are doing now, with all of it's high powered machinery, and bring it back to that little child.

Why am I writing about this now? I thought I was going to give you a field guide to all things IT. These days, I find myself back at square one, and in many ways I'm a child again. I never really understood what I was doing in the field I actually worked in, so I bumbled that up by not being authentic and honest with myself. I've forgot a lot of math because it didn't get used in my job, and am now planning on understanding how floating point arithmetic works in Java. I would probably need to start with calculus and real numbers from the beginning if I were to get back into math. Today, I have sort of made a pact with myself to always do work that has practical application, and within the confines of reason, ability, and time, maintain the curiosity to break things down to their elements. In a way, I am happy that I did not go into academics since I think my life now is simpler and I am more focused on being a productive member of society.

I also wanted very much to be employed and earn a reasonable living in exchange for a reasonable amount of work. I had at most two interviews for academic jobs, both were cold and resulted in wasted time and money traveling to conferences. It was highly competitive and seemingly impossible to find even entry level teaching jobs, but I loved doing math so much. I would tell anyone pursuing an academic career to liken it to making a major league baseball team's roster. Respect the accomplishments of those who make it, but be willing to accept other possibilities and embrace a well-rounded life if you don't.

Nowadays, my voicemail is full of recruiters with copies of an old resume from Monster, wanting to hire me as a software developer. I feel much more confident in my ability to find work, so you can get your hopes up...you will be in demand.

# Enter the Modern 'Enterprise'

What I'm about to say is not meant to frustrate, it is meant to reflect *my* frustration.

> Your number one obstacle in IT will not be technology. It will be people and their backwards tendency to build fiefdoms.

This statement is probably more true in so called 'enterprise' environments (a meaningless term, but you can take it to mean that there is more money around), than it would be in a small web start up in Austin, but I believe it is something we all suffer from and need to be cognizant of, in ourselves as well as others. Individually, we can introduce needless complexity to try and solve a problem. Maybe we want to try a new technology and think it will work, but get defensive when we have gone too far and our reputation's at stake. That's a harmless version of this problem, and can be defeated with discipline and experience. What I'm referring to is the hordes of lower to mid-level managers you will encounter in IT, each one jockeying against the other like politicians running for reelection. Let's break this down a bit.

In software development, there are resources like servers, memory, hard disks, networks, etc. When you are writing software, you need to deploy your code into an environment that requires resources. Invariably, what I have found is that I have been limited in what I need to do by the perception that I am 'taking' someone's resources, or that someone is doing me a personal favor by providing compute resources. I'm just doing my fucking job in the most neutral and generic way for the company, working 9 to 5, trying to be useful and not lose my mind in the process. My goal at work is to simply do what I need to do, then leave. But then there are people (usually managers) who take their jobs personally and want to be petty. I usually find these types at the lower end of the spectrum, and rarely hear anything intelligent from them. They are able to magically create this false impression of *ownership*. Let's go in that direction shall we?

## Who Owns That?

You will hear the term *owner* thrown around a bit to refer to someone who has some type of controlling stake in a project or piece of software. If someone is an owner, it usually means that their goal at work is to simply own as many projects as they can. If you ask them what they do, they won't be able to tell you because, let me whisper this little factoid in your ear...

> they don't do shit

You as the software developer take an idea, requirement, user story, etc. and produce (from nothing usually) a piece of software. Let's break this down:

* something **needed** to be developed
* you used your skills to **create** a piece of software
* you can **see** the software running and use it to solve problems that were previously unsolvable or tedious

You are the creator. Something wasn't there before, and then it was. That's real. Ownership is not.

Let's take another example,

* a valuable complex piece of software is broken
* you with your skills hook up a remote debug session through a firewall to identify the problem
* you *create* or change code to fix the problem
* what was broke is now fixed and looks great again

Again, who owns that? Who gives a fuck? When you were in elementary school and were dreaming about what work would be like, did you seriously imagine your main occupation to be taking credit for work that people with real skills produced?

# Worst Practices

Here's another one for you.

> I have not been in a single software development job that uses any of the best practices that are usually employed when developing modern software.

That's right, not one. In fact, I have fought tooth and nail with managers in every job I have had to adopt modern software practices. Not one of them has taken my skills, background, and aptitude for abstract thought into account to let me contribute a new idea, or shape a role for myself. I hate to blow my own horn, but I'm 38 years old with a PhD in mathematics, and successful IT experience working with all types of people. My role should be whatever the fuck I declare it to be when I mosey into town and see what the locals need to get running water again. Instead I feel like I'm stuck in this Twilight Zone episode where people refuse to acknowledge my ability, experience, or accomplishments to keep me in some arrested infantile state.

I am a fierce DevOps advocate, and I was led to those practices naturally, through necessity and encountering problems in deploying software in my day to day work. I literally had a nagging problem, read about DevOps practices, and used what I read to solve it myself. For example, those fiefdom builders I mentioned earlier are one of the main antagonists in the DevOps story and there are practices in DevOps that directly address transparency, visibility into process, etc. This is how I work. I follow my own intellect and choose the practices that help me solve what is in front of my eyes. I work along side people who back up their tool sets and the things they do because of real experience. When I bring up a new idea, I do it through demonstrations and presentations. I leave behind my ideas in the form of git repos that you can clone and run yourself...my story starts and ends with code.

I literally still have people (managers) who do not write a single line of anything (Excel doesn't count) somehow influencing how I work and what tools I can use, and it is 100% due to petty bullshit agendas that not even Betty one seat over knows about. There are no meetings. No roadmaps. No memos because that would require unambiguous communication. It is all behind the scenes, but at the end of the day it means your lightweight scalable superfast REST API backed by MongoDB and deployed with Docker needs to be migrated to Oracle, because...well, we use Oracle around here.

And lastly, even basic habits like

* actually using a logger or having some log statements in place
* unit testing
* documenting code

are nonexistent, indirectly discouraged by non participation, or even blatantly discouraged by management with the excuse that they eat too much time.

Unit testing is a big one with me. The developer who showed me how to unit test taught me that every method I write should be covered by a test. What happens is that you spend some initial time putting the testing framework in place, creating a directory, etc. and figuring out some of the most common test patterns you need to test the code you most frequently write. With experience, this adds almost no additional time to project setup, and in fact most build tools add this scaffolding for you automatically, with hooks to run your tests on every build. Once you get the hang of unit testing, writing tests at the same time you code becomes natural. The unit tests offer all sorts of benefits during development time:

* running the test against the code as your write it gives a rock solid guarantee that it works as expected
* if you can't naturally test your code in isolated units, it usually means the design is poor
* a quick debug entry point versus starting the full application and coercing the affected code path to fire

When you find yourself the only one on the team writing unit tests up front as you code, you may be slower in the short term than your teammates, but keep putting those tests in place and using them to drive your API. You will catch bugs and put in place a framework where assumptions about how code should behave can be documented with functioning test code. When new bugs arise, show your team how to catch the bug with a test to ensure it doesn't crop up again. At the same time, you will encourage a more modular object oriented design because you are testing modules along the way. If your manager gives you shit, just remember he has no business managing a software development team if he tells you to not unit test your code.

# Loneliness and Isolation

Developers can work day to day within a few feet of each other, but be isolated by imaginary **silos**. Even developers on the same team can be fragmented and played off one another by shrewd operatives. The most difficult experiences I've had are when I'm trying to put in place something new, I know it will just work, but I'm being denied by management. It's difficult and you can feel at times like people are just watching you, waiting for you to go crazy because they are sort of aware of the inevitable fallibility and dysfunction of their work place.

You have to keep reminding yourself a singular truth about this job

> It does not truly matter.

Remember that software is for people and should serve people...not the other way around. This goes for the tools developers use, down to the actual product for the end user.

Lastly, you can also get into a spot where your family doesn't understand the time you need to spend to broaden and add to your skill set. This is a tough one, and I have no good advice to give anyone. In practice, I regularly get bleed over into my family time where I have to work on something. The ideal is to have a work environment that is challenging you in order for you to be productive for them. This is fundamentally not the case, and I find that I am usually trying to find side projects for me to work on just to *keep* my skills sharp. To me this is such a travesty, and I deserve better since I have the discipline for it. These companies seem to just want to pay me more to do less work. I don't want more money, I want to do something meaningful.
