
import { Button } from "@/components/ui/button";
import { PETITION_THRESHOLD } from "@/hooks/usePetitions";

export const PetitionInfo = () => {
  return (
    <div className="mt-12 bg-gray-50 rounded-lg p-6">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-campus-blue mb-4">How Petitions Work</h2>
        <p className="text-gray-600 mb-6">
          When {PETITION_THRESHOLD} or more students request the same class section, our system automatically
          generates a Google Form petition that can be submitted to faculty members
          requesting a new section based on student demand.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild variant="outline">
            <a href="/swap-requests">Create a Petition</a>
          </Button>
          <Button variant="secondary">Learn More</Button>
        </div>
      </div>
    </div>
  );
};
