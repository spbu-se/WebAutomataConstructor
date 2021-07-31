import React, {Component} from 'react';
import ControlWrapper from "../ControlWrapper/ControlWrapper";
import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import { withStyles, Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

const useStyles = makeStyles({
  table: {
    //maxWidth: 250,
    width: "100%",
  },
});

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
      fontSize: 14,
    },
    body: {
      fontSize: 14,
    },
  }),
)(TableCell);

type TestState = {
  inputString: string
  shall: boolean
  result: string
  handleRemove: (i: number) => void
}

export default function ControlTests() {
  
  
  const classes = useStyles();
  
  return (
    <ControlWrapper title = {"Tests"}>
    <TableContainer component={Paper}>
      <Table className={classes.table}  size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
          <StyledTableCell>Строка</StyledTableCell>
            <StyledTableCell align="right">Отклоняется</StyledTableCell>
            <StyledTableCell align="right">Результат</StyledTableCell>
            <StyledTableCell align="right">Запуск</StyledTableCell>
            <StyledTableCell align="right">Удалить</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
           <TableRow >
              <TableCell component="th" scope="row" >
              <TextField label="Входная строка"/>
              </TableCell>
              <TableCell align="right"><Checkbox
                defaultChecked
                color="primary"
                inputProps={{ 'aria-label': 'secondary checkbox' }}
              /></TableCell>
              <TableCell align="right">{}</TableCell>
              <TableCell align="right"> <IconButton aria-label="playArrow">
                <PlayArrowIcon />
                </IconButton> </TableCell>
              <TableCell align="right">   <IconButton aria-label="delete">
                <DeleteIcon />
                </IconButton> 
              </TableCell>
            </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  </ControlWrapper>
  );
}
