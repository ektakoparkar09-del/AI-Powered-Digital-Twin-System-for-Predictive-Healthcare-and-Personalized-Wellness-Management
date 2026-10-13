import React from "react";



import {
  calculateBMI,
  calculateDiseaseRisks
} from "@/lib/healthUtils";


import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";


import {
  Badge
} from "@/components/ui/badge";


import {
  Heart,
  Droplets,
  Brain,
  Activity,
  ShieldCheck,
  Sparkles,
  Loader2
} from "lucide-react";


import {
  motion
} from "framer-motion";



export default function DiseasePrediction(){



const [profile, setProfile] = React.useState(null);

React.useEffect(() => {
  const data = JSON.parse(localStorage.getItem("healthProfile"));
  setProfile(data);
}, []);












if(!profile){
return (

<Card className="m-6">


<CardContent className="py-10 text-center">


<h2 className="text-xl font-bold">

No Health Profile Found

</h2>


<p className="text-muted-foreground mt-2">

Please complete your Health Profile first.

</p>


</CardContent>


</Card>

)

}

const bmi =
  profile.bmi ||
  calculateBMI(profile.weight_kg, profile.height_cm);

// Calculate Disease Risks


const risks =
calculateDiseaseRisks(profile);







const predictions=[

{
name:"Heart Disease",
risk:risks.heart || 0,
icon:Heart
},


{
name:"Diabetes",
risk:risks.diabetes || 0,
icon:Droplets
},


{
name:"Stroke",
risk:risks.stroke || 0,
icon:Brain
},


{
name:"Hypertension",
risk:risks.hypertension || 0,
icon:Activity
}

];








// Generate Risk Factors


const riskFactors=[];



if(profile.blood_pressure_systolic > 140)

riskFactors.push(
"High Blood Pressure"
);



if(bmi > 30)

riskFactors.push(
"High BMI / Obesity"
);



if(
profile.exercise_frequency === "none"
)

riskFactors.push(
"Low Physical Activity"
);



if(
profile.blood_sugar > 140
)

riskFactors.push(
"Elevated Blood Sugar"
);



if(
profile.cholesterol > 200
)

riskFactors.push(
"High Cholesterol"
);



if(
profile.family_history?.length
)

riskFactors.push(
"Family Disease History"
);







const overallRisk = Math.round(

predictions.reduce(

(sum,item)=>

sum + item.risk,

0

)

/

predictions.length

);








const recommendations=[


"Maintain a balanced diet with reduced processed foods",


"Exercise at least 30 minutes daily",


"Monitor blood pressure and sugar regularly",


"Maintain healthy weight and sleep schedule",


"Follow preventive health checkups"



];









return (

<div className="space-y-6 p-4">






{/* Header */}


<motion.div

initial={{
opacity:0,
y:-10
}}

animate={{
opacity:1,
y:0
}}

>


<h1 className="text-3xl font-bold">

Disease Prediction AI

</h1>



<p className="text-muted-foreground">

AI-based chronic disease risk assessment

</p>


</motion.div>









{/* Overall Risk */}



<Card className="glass-card">


<CardHeader>


<CardTitle>

Overall Health Risk

</CardTitle>


</CardHeader>




<CardContent>


<div className="text-5xl font-bold text-primary">

{overallRisk}%

</div>



<Badge className="mt-3">


{

overallRisk >=70

?

"High Risk"

:

overallRisk >=40

?

"Moderate Risk"

:

"Low Risk"

}


</Badge>


</CardContent>


</Card>









{/* Disease Cards */}



<div className="grid grid-cols-1 md:grid-cols-4 gap-5">



{

predictions.map(

(item,index)=>{


const Icon=item.icon;


return (

<motion.div

key={index}

initial={{
opacity:0,
y:20
}}

animate={{
opacity:1,
y:0
}}

transition={{
delay:index*0.1
}}

>


<Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">


<CardContent className="p-5">


<Icon

className="w-8 h-8 text-primary"

/>



<h3 className="mt-4 font-semibold">

{item.name}

</h3>



<p className="text-3xl font-bold mt-2">

{item.risk}%

</p>




<Badge>


{

item.risk >=70

?

"High Risk"

:

item.risk >=40

?

"Moderate"

:

"Low"

}


</Badge>




</CardContent>


</Card>


</motion.div>


)


}

)

}



</div>









{/* Risk Factors */}




<Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">


<CardHeader>


<CardTitle className="flex gap-2 items-center">


<ShieldCheck/>

Main Risk Factors


</CardTitle>


</CardHeader>




<CardContent>


{

riskFactors.length > 0

?

(

<ul className="space-y-2">


{

riskFactors.map(

(item,index)=>(


<li key={index}>

✓ {item}

</li>


)

)

}


</ul>

)

:

(

<p className="text-muted-foreground">

No major risk factors detected.

</p>

)


}


</CardContent>


</Card>









{/* Recommendations */}




<Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">


<CardHeader>


<CardTitle className="flex gap-2 items-center">


<Sparkles/>

AI Prevention Plan


</CardTitle>


</CardHeader>



<CardContent>


<ul className="space-y-2">


{

recommendations.map(

(item,index)=>(


<li key={index}>

• {item}

</li>


)

)

}


</ul>


</CardContent>


</Card>








</div>


);


}
