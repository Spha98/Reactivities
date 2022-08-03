import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { Activity } from "../Models/activity";
import {format} from 'date-fns'

export default class ActivityStore{

    ActivityRegistry = new Map<string, Activity>();
    selectedActivity: Activity | undefined = undefined;
    editMode = false;
    loading = false;
    loadingInitial = false;

    constructor(){
        makeAutoObservable(this)  
    }

    get activitiesByDate(){
        return Array.from(this.ActivityRegistry.values()).sort((a,b) => 
        a.date!.getTime() - b.date!.getTime());
    }

    get groupedActivities() {
        return Object.entries(
            this.activitiesByDate.reduce((activities, activity) =>{
                const date = format(activity.date!,'dd MMM yyyy');
                activities[date] = activities[date] ? [...activities[date], activity] : [activity];
                return activities;
            }, {} as {[key: string]: Activity[]})
        )
    }

    loadActivities = async () =>{
        this.loadingInitial = true;
        try {
            const activities = await agent.Actiivities.list();
                activities.forEach(activity => {
                   this.setActivity(activity);
                  }) 
                  this.setLoadingInitial(false);
        } catch (error) {
            console.log(error);
            this.setLoadingInitial(false);
           
        }
    }

    loadActivity = async (id: string) =>{
        let activity = this.getActivity(id);
        if (activity){
            this.selectedActivity = activity;
            return activity;
        } else{
            this.loadingInitial = true;
            try {
                activity = await agent.Actiivities.details(id);
                this.setActivity(activity);
               runInAction(() =>{
                this.selectedActivity = activity;
               })
                this.setLoadingInitial(false);
                return activity;
            } catch (error) {
                console.log(error);
                this.setLoadingInitial(false);
            }
        }
    }

    private setActivity = (activity: Activity) =>{
        activity.date = new Date(activity.date!);
        this.ActivityRegistry.set(activity.id, activity);
    }

    private getActivity = (id: string) =>{ 
        return this.ActivityRegistry.get(id);
    }

    setLoadingInitial = (state: boolean) => {
        this.loadingInitial = state;
    }


    createActivity = async (activity: Activity) =>{
        this.loading = true;
        try {
            await agent.Actiivities.create(activity);
            runInAction(() => {
                this.ActivityRegistry.set(activity.id, activity);
                this.selectedActivity = activity;
                this.editMode = false;
                this.loading = false;
            })
        } catch (error) {
            console.log(error)
            runInAction(() => {
                this.loading = false;
            })
        }
    }

    updateActivity =async (activity:Activity) => {
        this.loading = true;
        try {
            await agent.Actiivities.update(activity);
            runInAction(() => {
                this.ActivityRegistry.set(activity.id,activity);
                this.selectedActivity = activity;
                this.editMode = false;
                this.loading = false;
            })
        } catch (error) {
            runInAction(() => {
                this.loading = false;
            })
        }
    }

    deleteActivity = async (id : string) =>{
        this.loading = true;
        try {
            await agent.Actiivities.delete(id);
            runInAction(() => {
                this.ActivityRegistry.delete(id)
                this.loading = false;
            })
        } catch (error) {
            console.log(error)
            runInAction(() => {
                this.loading = false;
            })
        }
       
    }
}