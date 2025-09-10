import json
import numpy as np
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.medicine import Medicine, Symptom, SymptomMedicineMapping
from app.schemas.medicine import MedicineRecommendation, MedicineRecommendationRequest

class AIMedicineService:
    def __init__(self, db: Session):
        self.db = db
        
    def analyze_symptoms(self, request: MedicineRecommendationRequest) -> Dict[str, Any]:
        """Analyze symptoms and provide AI assessment"""
        
        # Get symptom data from database
        symptoms_data = []
        for symptom_name in request.symptoms:
            symptom = self.db.query(Symptom).filter(
                Symptom.name.ilike(f"%{symptom_name}%")
            ).first()
            if symptom:
                symptoms_data.append(symptom)
        
        if not symptoms_data:
            return {
                "assessment": "No matching symptoms found in database",
                "severity": 1,
                "emergency": False,
                "confidence": 0.1
            }
        
        # Calculate overall severity
        avg_severity = sum(s.severity_level for s in symptoms_data) / len(symptoms_data)
        
        # Determine if emergency
        emergency_keywords = ["chest pain", "difficulty breathing", "severe bleeding", 
                            "unconscious", "seizure", "stroke", "heart attack"]
        emergency_flag = any(keyword in " ".join(request.symptoms).lower() 
                           for keyword in emergency_keywords)
        
        # AI confidence based on symptom matches and data quality
        confidence = min(0.9, len(symptoms_data) / len(request.symptoms) * 0.8 + 0.2)
        
        return {
            "assessment": f"Analyzed {len(symptoms_data)} symptoms with average severity {avg_severity:.1f}",
            "severity": int(avg_severity),
            "emergency": emergency_flag,
            "confidence": confidence,
            "matched_symptoms": [s.name for s in symptoms_data]
        }
    
    def get_medicine_recommendations(self, request: MedicineRecommendationRequest) -> List[MedicineRecommendation]:
        """Get AI-powered medicine recommendations based on symptoms"""
        
        recommendations = []
        
        # Get symptom-medicine mappings
        symptom_ids = []
        for symptom_name in request.symptoms:
            symptom = self.db.query(Symptom).filter(
                Symptom.name.ilike(f"%{symptom_name}%")
            ).first()
            if symptom:
                symptom_ids.append(symptom.id)
        
        if not symptom_ids:
            return recommendations
        
        # Get medicine mappings
        mappings = self.db.query(SymptomMedicineMapping).filter(
            SymptomMedicineMapping.symptom_id.in_(symptom_ids)
        ).all()
        
        # Group by medicine and calculate scores
        medicine_scores = {}
        for mapping in mappings:
            medicine_id = mapping.medicine_id
            if medicine_id not in medicine_scores:
                medicine_scores[medicine_id] = {
                    'total_score': 0,
                    'count': 0,
                    'confidence': 0
                }
            
            medicine_scores[medicine_id]['total_score'] += mapping.effectiveness_score
            medicine_scores[medicine_id]['count'] += 1
            medicine_scores[medicine_id]['confidence'] += mapping.confidence_level
        
        # Get top medicines
        sorted_medicines = sorted(
            medicine_scores.items(),
            key=lambda x: x[1]['total_score'] / x[1]['count'],
            reverse=True
        )[:5]  # Top 5 recommendations
        
        for medicine_id, scores in sorted_medicines:
            medicine = self.db.query(Medicine).filter(Medicine.id == medicine_id).first()
            if medicine and medicine.is_available:
                
                avg_score = scores['total_score'] / scores['count']
                avg_confidence = scores['confidence'] / scores['count']
                
                # Generate dosage recommendation based on patient data
                dosage = self._generate_dosage_recommendation(medicine, request)
                duration = self._calculate_duration(medicine, request.severity_level)
                warnings = self._generate_warnings(medicine, request)
                reasoning = self._generate_reasoning(medicine, request.symptoms, avg_score)
                
                recommendation = MedicineRecommendation(
                    medicine=medicine,
                    confidence_score=avg_confidence,
                    dosage_recommendation=dosage,
                    duration_days=duration,
                    warnings=warnings,
                    reasoning=reasoning
                )
                
                recommendations.append(recommendation)
        
        return recommendations
    
    def _generate_dosage_recommendation(self, medicine: Medicine, request: MedicineRecommendationRequest) -> str:
        """Generate personalized dosage recommendation"""
        base_dosage = medicine.dosage_instructions or "As directed by physician"
        
        # Adjust for age
        if request.patient_age:
            if request.patient_age < 12:
                return f"Pediatric dose: {base_dosage} (consult pediatrician)"
            elif request.patient_age > 65:
                return f"Geriatric dose: {base_dosage} (may need adjustment)"
        
        # Adjust for weight if available
        if request.patient_weight and request.patient_weight < 50:
            return f"Low weight dose: {base_dosage} (consider reduced dose)"
        
        return base_dosage
    
    def _calculate_duration(self, medicine: Medicine, severity: int) -> int:
        """Calculate treatment duration based on medicine type and severity"""
        if "antibiotic" in medicine.category.lower():
            return max(5, min(10, severity * 2))  # 5-10 days for antibiotics
        elif "painkiller" in medicine.category.lower():
            return max(3, min(7, severity))  # 3-7 days for painkillers
        else:
            return max(3, min(14, severity * 3))  # 3-14 days for others
    
    def _generate_warnings(self, medicine: Medicine, request: MedicineRecommendationRequest) -> List[str]:
        """Generate personalized warnings"""
        warnings = []
        
        # Check allergies
        if request.allergies:
            for allergy in request.allergies:
                if allergy.lower() in medicine.name.lower() or allergy.lower() in medicine.generic_name.lower():
                    warnings.append(f"⚠️ ALLERGY ALERT: Patient allergic to {allergy}")
        
        # Age-based warnings
        if request.patient_age and request.patient_age < 18:
            warnings.append("Consult pediatrician before administration")
        
        # Add medicine-specific warnings
        if medicine.contraindications:
            warnings.append(f"Contraindications: {medicine.contraindications}")
        
        if medicine.side_effects:
            warnings.append(f"Possible side effects: {medicine.side_effects}")
        
        return warnings
    
    def _generate_reasoning(self, medicine: Medicine, symptoms: List[str], score: float) -> str:
        """Generate AI reasoning for the recommendation"""
        return (f"Recommended based on symptom analysis. "
                f"This medicine is {score*100:.0f}% effective for treating: {', '.join(symptoms[:3])}. "
                f"Indicated for: {medicine.indications or 'general symptoms'}")
