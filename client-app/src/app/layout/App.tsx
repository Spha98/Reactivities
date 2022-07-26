import React, { Fragment, useEffect, useState } from 'react';
import { Container } from 'semantic-ui-react';
import { Activity } from '../Models/activity';
import NavBar from './NAvBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import {v4 as uuid} from 'uuid';
import agent from '../api/agent';
import LoadingComponent from './LoadingComponent';

function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);
  const [editMode, seteditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
      agent.Actiivities.list().then(  response => {    
        let activities: Activity[] = [];
        response.forEach(activity => {
          activity.date = activity.date.split('T')[0];
          activities.push(activity);
        })
        setActivities(response);
        setLoading(false);
      })
    }, []);


    function handleSelectActivity(id : string)
    {
      setSelectedActivity(activities.find(x => x.id === id))
    }

    function handleCancelSelectedActivity()
    {
      setSelectedActivity(undefined)
    }

    function handleFormOpen(id? : string)
    {
      id ?  handleSelectActivity(id) : handleCancelSelectedActivity();
      seteditMode(true);
    }
    function handleFormClose()
    {
      seteditMode(false);
    }

    function handleCreateOrEditActivity(activity: Activity){
      setSubmitting(true);
      if (activity.id)
      {
        agent.Actiivities.update(activity).then(() =>{
          setActivities([...activities.filter(x=>x.id !== activity.id), activity])
          setSelectedActivity(activity);
          seteditMode(false);
          setSubmitting(false);
        })
      } else{
        activity.id = uuid()
          agent.Actiivities.create(activity).then(() =>{
          setActivities([...activities,activity])
          setSelectedActivity(activity);
          seteditMode(false);
          setSubmitting(false);
        })
      }
    }

    function handleDeleteActivity(id : string)
    {
      setSubmitting(true);
        agent.Actiivities.delete(id).then(() => {
        setActivities([...activities.filter(x=>x.id !== id)])
        setSubmitting(false);
      })
    }

    if (loading) return <LoadingComponent content='Loading app'/>

  return (
    <div >
        <NavBar openForm={handleFormOpen}/>
          <Container style={{marginTop:'7em'}}>
              <ActivityDashboard 
              activities={activities}
              selectedActivity = {selectedActivity}
              selectActivity = {handleSelectActivity}
              cancelSelectedActivity = {handleCancelSelectedActivity}
              editMode = {editMode}
              openForm = {handleFormOpen}
              closeForm = {handleFormClose}
              createOrEdit={handleCreateOrEditActivity}
              deleteActivity ={handleDeleteActivity}
              submitting = {submitting}
          />
          </Container>
    </div>
  );
}

export default App;
