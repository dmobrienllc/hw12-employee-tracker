const inquirer = require('inquirer');
const TeamController = require('./lib/team-controller');
const { exception } = require('console');

let teamController = new TeamController("");
let isDoneAddingMembers = false;
let isTesting = true;

const addManager = () => {
  inquirer.prompt([
    {
        type: "input",
        message: "What is the manager's id?",
        name: "mgrid"
    },
    {
      type: "input",
      message: "Please add manager name.",
      name: "mgrname"
    },
    {
      type: "input",
      message: "Please enter your email",
      name: "mgremail",
      default: () => {},
      validate: function (email) {

          valid = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)

          if (valid) {
              return true;
          } else {
              console.log(".  Please enter a valid email")
              return false;
          }
      }
    },
    {
        type: "input",
        message: "What is the managers office number?",
        name: "mgrofficenbr"
    },
    {
        type: "input",
        message: "What is the team name?",
        name: "teamname"
    }
  ]).then( ({mgrid,mgrname, mgremail, mgrofficenbr, teamname}) => {
        teamController.setTeamName(teamname);
        teamController.addManager(mgrid,mgrname, mgremail, mgrofficenbr);
        start();
  });
}

const addTeamMember = () => {
    inquirer.prompt([
      {
        type: "list",
        message: "Please select type of team member to add, or select 'None' when completed. ",
        choices: [ "Intern", "Engineer", "None" ],
        name: "employeeTypeToAdd"
      }
    ]).then( ({employeeTypeToAdd}) => {
      switch(employeeTypeToAdd){
        case "Intern":
          addIntern();
          break;
  
        case "Engineer":
          addEngineer();
          break;
  
        case "None":
          isDoneAddingMembers = true;
          start();
          break;
  
        default:
        
          break;
      }
    })
  }

  const addIntern = () => {
    inquirer.prompt([
        {
            type: "input",
            message: "What is the intern's id?",
            name: "id"
        },
        {
          type: "input",
          message: "What is the intern's name?",
          name: "name"
        },
        {
          type: "input",
          message: "What is the intern's email",
          name: "email",
          default: () => {},
          validate: function (email) {
    
              valid = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
    
              if (valid) {
                  return true;
              } else {
                  console.log(".  Please enter a valid email")
                  return false;
              }
          }
        },
        {
            type: "input",
            message: "What school did the intern attend?",
            name: "school"
        }
      ]).then( ({id,name, email, school}) => {
            teamController.addIntern(id,name,email, school);
            start();
      });
  }

  const addEngineer = () => {
    inquirer.prompt([
        {
            type: "input",
            message: "What is the engineer's id?",
            name: "id"
        },
        {
          type: "input",
          message: "What is the engineer's name?",
          name: "name"
        },
        {
          type: "input",
          message: "What is the engineer's email",
          name: "email",
          default: () => {},
          validate: function (email) {
    
              valid = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
    
              if (valid) {
                  return true;
              } else {
                  console.log(".  Please enter a valid email")
                  return false;
              }
          }
        },
        {
            type: "input",
            message: "What is the engineer's github account name?",
            name: "githubacct"
        }
      ]).then( ({id,name, email, githubacct}) => {
            teamController.addEngineer(id,name,email, githubacct);
            start();
      });
  }

  const renderProfile = () => {
    let templateHelper = new TemplateHelper(teamController);
    let profileHtml = templateHelper.generateTeamProfileHtml();

    try{
        fs.writeFile(`./dist/teamprofile.html`, profileHtml, (err) => {
            if (err) throw new exception(err.message);
            console.log('The file has been saved!');
          });
    }
    catch (error) {
        console.error(error);
      }
  }

const start = () => {
    if(!isDoneAddingMembers){
        if(!teamController.managerAdded){
            addManager();
        }else{
            addTeamMember();
        }
    }else{
        renderProfile();
    }
    
}

start();