import { ScaleIcon } from "@/components/icons";

const team = [
  {
    name: "Av. Mehmet Yılmaz",
    title: "Kurucu Ortak",
    specialization: "Kurumsal Hukuk, M&A",
    image: null,
  },
  {
    name: "Av. Ayşe Demir",
    title: "Kurucu Ortak",
    specialization: "Ceza Hukuku, Savunma",
    image: null,
  },
  {
    name: "Av. Mustafa Koç",
    title: "Kıdemli Avukat",
    specialization: "Gayrimenkul Hukuku",
    image: null,
  },
  {
    name: "Av. Zeynep Arslan",
    title: "Avukat",
    specialization: "Aile Hukuku, Miras",
    image: null,
  },
];

export default function TeamPage() {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Ekibimiz</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Deneyimli ve profesyonel avukat kadromuz
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="h-64 bg-gray-200 border-2 border-dashed rounded-none flex items-center justify-center">
                <ScaleIcon className="w-16 h-16 text-gray-400" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-secondary font-medium mb-2">{member.title}</p>
                <p className="text-gray-600 text-sm">{member.specialization}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}