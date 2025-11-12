import TeamMember from '../TeamMember';
import teamImage from "@assets/generated_images/Team_member_portrait_1_976007be.png";

export default function TeamMemberExample() {
  return (
    <div className="p-8 max-w-sm">
      <TeamMember
        name="Maria Rossi"
        role="Consulente Immobiliare Senior"
        image={teamImage}
        quote="Aiutare le famiglie a trovare casa è la mia passione"
        email="maria@maggiolini.it"
        phone="+39 348 123 4567"
      />
    </div>
  );
}
