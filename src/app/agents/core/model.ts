export interface ArchitectComponentTask {
  id?: string;
  task: string;
  // completed?:boolean;
}
export enum PlanProgress {
  idle,
  inProgress,
  complete
}

export interface ArchitectSlidePlan {
  slideId?: string;
  components: ArchitectComponentTask[];
  planProgress?: PlanProgress;

}
export interface PresentationArchitecture {
  presentation: {
    slides: ArchitectSlidePlan[];
  };
}
