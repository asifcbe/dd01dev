import {
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";

export default function  LoadMask({text}){
return (<Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.default",
          flexDirection:'column'
        }}
      >
        <CircularProgress />
        <Typography color='primary' component="h1" variant="h6">
              {text}
            </Typography>
        
      </Box>)
    }

    ()=>{
        return
    }