import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";

export default function StateCard({ data }) {
  return (
    <Card
      sx={{
        width: "100%",
        maxWidth: 260,
        backgroundColor: "#161B2E",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        p: 2,
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-6px)",
        },
      }}
    >
      <CardContent>
        <Typography
          level="body-sm"
          sx={{
            color: "#9CA3AF",
          }}
        >
          Total Tasks
        </Typography>

        <Typography
          level="h1"
          sx={{
            color: "#FFFFFF",

            mt: 1,

            fontWeight: 700,
          }}
        >
          {data}
        </Typography>

        <Typography
          level="body-sm"
          sx={{
            color: "#00D26A",

            mt: 1,
          }}
        >
          +12% this week
        </Typography>
      </CardContent>
    </Card>
  );
}
