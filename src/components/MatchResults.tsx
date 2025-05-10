
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";

// Mock data for matches - in a real app, this would come from a backend
const mockMatches = [
  {
    id: 1,
    course: "Machine Learning",
    currentSection: "Section 1 (Mon/Wed 10:00 AM)",
    desiredSection: "Section 2 (Sun/Tue/Thu 2:00 PM)",
    user: "Ahmed K.",
    isAnonymous: false,
    matchPercent: 95,
    type: "swap",
  },
  {
    id: 2,
    course: "Advanced Algorithms",
    currentSection: "Section 2 (Sun/Tue/Thu 11:00 AM)",
    desiredSection: "Section 1 (Mon/Wed 9:00 AM)",
    user: "Anonymous",
    isAnonymous: true,
    matchPercent: 100,
    type: "swap", 
  },
  {
    id: 3,
    course: "Data Structures",
    currentSection: null,
    desiredSection: "Section 1 (Mon/Wed 1:00 PM)",
    user: "Sara L.",
    isAnonymous: false,
    matchPercent: 80,
    type: "petition",
  },
  {
    id: 4,
    course: "Web Development",
    currentSection: "Section 3 (Mon/Wed 3:00 PM)",
    desiredSection: "Section 1 (Mon/Wed 10:00 AM)",
    user: "Anonymous",
    isAnonymous: true,
    matchPercent: 70,
    type: "swap",
  },
];

const MatchResults = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [matchType, setMatchType] = useState("all");
  const [sortBy, setSortBy] = useState("match");

  // Filter and sort the matches based on user selections
  const filteredMatches = mockMatches.filter(match => {
    // Filter by search query
    const matchesSearch = 
      match.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (match.currentSection && match.currentSection.toLowerCase().includes(searchQuery.toLowerCase())) ||
      match.desiredSection.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by match type
    const matchesType = 
      matchType === "all" || 
      (matchType === "swap" && match.type === "swap") || 
      (matchType === "petition" && match.type === "petition");
    
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    // Sort based on user selection
    if (sortBy === "match") {
      return b.matchPercent - a.matchPercent;
    } else if (sortBy === "course") {
      return a.course.localeCompare(b.course);
    }
    return 0;
  });

  const handleContact = (matchId: number) => {
    // In a real app, this would open a contact option or reveal Telegram username
    const match = mockMatches.find(m => m.id === matchId);
    if (match) {
      alert(`Contact ${match.user} via Telegram to discuss a swap for ${match.course}`);
    }
  };

  return (
    <Card className="border-campus-purple/20">
      <CardHeader>
        <CardTitle className="text-campus-darkPurple">Matching Results</CardTitle>
        <CardDescription>
          Find compatible swap requests from other students
        </CardDescription>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by course or section..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={matchType} onValueChange={setMatchType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="swap">Swaps Only</SelectItem>
                <SelectItem value="petition">Petitions Only</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match">Best Match</SelectItem>
                <SelectItem value="course">Course Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredMatches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No matches found for your search criteria.</p>
            <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Request Type</TableHead>
                  <TableHead>From / To</TableHead>
                  <TableHead>Posted By</TableHead>
                  <TableHead className="text-right">Match</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMatches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell className="font-medium">{match.course}</TableCell>
                    <TableCell>
                      <Badge variant={match.type === "swap" ? "outline" : "secondary"} className={match.type === "swap" ? "border-campus-purple text-campus-purple" : ""}>
                        {match.type === "swap" ? "Swap" : "Petition"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {match.type === "swap" ? (
                        <div className="text-sm">
                          <div>From: {match.currentSection}</div>
                          <div>To: {match.desiredSection}</div>
                        </div>
                      ) : (
                        <div className="text-sm">Wants: {match.desiredSection}</div>
                      )}
                    </TableCell>
                    <TableCell>{match.user}</TableCell>
                    <TableCell className="text-right">
                      <span className={`font-medium ${match.matchPercent >= 90 ? 'text-green-600' : match.matchPercent >= 70 ? 'text-yellow-600' : 'text-gray-600'}`}>
                        {match.matchPercent}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        onClick={() => handleContact(match.id)}
                        className="bg-campus-purple hover:bg-campus-darkPurple"
                      >
                        Contact
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchResults;
